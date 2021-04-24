import cdk = require('@aws-cdk/core');
import { CfnDataSource, CfnResolver, MappingTemplate } from '@aws-cdk/aws-appsync';
import * as lambda from "@aws-cdk/aws-lambda";
import * as fs from 'fs';
import * as Path from "path";
import { prepareIam } from "./prepare_iam";
import { outputUsefulInfo } from "./output_useful_info";
import { prepareAppSync } from "./prepare_app_sync";
import { prepareNetwork } from "./prepare_network";
import { prepareDax } from "./prepare_dax";
import { prepareDynamoDb } from "./prepare_dynamo_db";
import { generateInitialData } from "./generate_initial_data";

function getTextFromFile(path: string) {
  return fs.readFileSync(Path.join(__dirname, path), 'utf-8').toString();
}

const responseMappingTemplate = '$util.toJson($ctx.result)';

export class TechnologyLearningAwsAppSyncStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    const guestbookRole = prepareIam(this);
    const commentsGraphQLApi = prepareAppSync(this, guestbookRole);
    let { commentsTable, gsiProps } = prepareDynamoDb(this);
    const { vpc, subnetGroup } = prepareNetwork(this);
    const daxCluster = prepareDax(this, commentsTable, subnetGroup);

    //Datasource resolvers:
    const dataSource = new CfnDataSource(this, 'GuestbookCommentDataSource', {
      apiId: commentsGraphQLApi.apiId,
      name: 'GuestbookCommentDynamoDataSource',
      type: 'AMAZON_DYNAMODB',
      dynamoDbConfig: {
        tableName: commentsTable.tableName,
        awsRegion: this.region,
      },
      serviceRoleArn: guestbookRole.roleArn
    });

    const saveResolver = new CfnResolver(this, 'SaveMutationResolver', {
      apiId: commentsGraphQLApi.apiId,
      typeName: 'Mutation',
      fieldName: 'createGuestbookComment',
      dataSourceName: dataSource.name,
      requestMappingTemplate: getTextFromFile('resolvers/createGuestbookComment.vm'),
      responseMappingTemplate: responseMappingTemplate
    });
    saveResolver.addDependsOn(dataSource);

    const genericStuffLayer = new lambda.LayerVersion(this, 'GenericStuffLayer', {
      code: lambda.Code.fromAsset("../lambdas/layer/genericStuff/packaged-dist/layers.zip"),
      compatibleRuntimes: [lambda.Runtime.NODEJS_14_X]
    });

    const getHandlerLambda = new lambda.Function(this, "GetHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("../lambdas/lambda/getComment/dist"),
      handler: "index.handler",
      layers: [
        genericStuffLayer
      ],
      environment: {
        TABLE_NAME: commentsTable.tableName,
        GSI_NAME: gsiProps.indexName,
        DAX_URL: daxCluster.attrClusterDiscoveryEndpoint
      },
    });
    commentsTable.grantFullAccess(getHandlerLambda);

    let getLambdaDataSource = commentsGraphQLApi.addLambdaDataSource('getHandlerLambdaDatasource', getHandlerLambda);
    getLambdaDataSource.createResolver({
      typeName: 'Query',
      fieldName: 'getGuestbookComment',
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem()
    });

    const listHandlerLambda = new lambda.Function(this, "ListHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("../lambdas/lambda/listComments/dist"),
      handler: "index.handler",
      layers: [
        genericStuffLayer
      ],
      vpc: vpc,
      environment: {
        TABLE_NAME: commentsTable.tableName,
        GSI_NAME: gsiProps.indexName,
        DAX_URL: daxCluster.attrClusterDiscoveryEndpoint
      },
    });
    commentsTable.grantFullAccess(listHandlerLambda);

    let listLambdaDataSource = commentsGraphQLApi.addLambdaDataSource('listHandlerLambdaDatasource', listHandlerLambda);
    listLambdaDataSource.createResolver({
      typeName: 'Query',
      fieldName: 'listGuestbookComments',
      responseMappingTemplate: {
        renderTemplate(): string {
          return '$util.toJson($ctx.result)'
        }
      }
    });

    const deleteHandlerLambda = new lambda.Function(this, "DeleteHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("../lambdas/lambda/deleteComment/dist"),
      handler: "index.handler",
      layers: [
        genericStuffLayer
      ],
      environment: {
        TABLE_NAME: commentsTable.tableName,
        GSI_NAME: gsiProps.indexName,
        DAX_URL: daxCluster.attrClusterDiscoveryEndpoint
      },
    });
    commentsTable.grantFullAccess(deleteHandlerLambda);

    let deleteLambdaDataSource = commentsGraphQLApi.addLambdaDataSource('deleteHandlerLambdaDatasource', deleteHandlerLambda);
    deleteLambdaDataSource.createResolver({
      typeName: 'Mutation',
      fieldName: 'deleteGuestbookComment',
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem()
    });

    generateInitialData(this, commentsTable);
    outputUsefulInfo(this, commentsGraphQLApi)
  }
}

const app = new cdk.App();
new TechnologyLearningAwsAppSyncStack(app, 'TechnologyLearningAwsAppSyncStack');
app.synth();
