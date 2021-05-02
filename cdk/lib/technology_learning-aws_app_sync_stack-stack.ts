import cdk = require('@aws-cdk/core');
import * as appsync from '@aws-cdk/aws-appsync';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as lambda from "@aws-cdk/aws-lambda";
import * as fs from 'fs';
import * as Path from "path";
import { Duration } from "@aws-cdk/core";

import { prepareAppSyncIam, prepareDaxIam } from "./prepare_iam";
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

    const guestbookRole = prepareAppSyncIam(this);
    const daxRole = prepareDaxIam(this);

    const {
      vpc,
      subnetGroup,
      subnet,
      securityGroup
    } = prepareNetwork(this);

    const commentsGraphQLApi = prepareAppSync(this, guestbookRole);
    let { commentsTable, gsiProps } = prepareDynamoDb(this);

    const daxCluster = prepareDax(this, commentsTable, subnetGroup, securityGroup, daxRole);

    //Datasource resolvers:
    const dataSource = new appsync.CfnDataSource(this, 'GuestbookCommentDataSource', {
      apiId: commentsGraphQLApi.apiId,
      name: 'GuestbookCommentDynamoDataSource',
      type: 'AMAZON_DYNAMODB',
      dynamoDbConfig: {
        tableName: commentsTable.tableName,
        awsRegion: this.region,
      },
      serviceRoleArn: guestbookRole.roleArn
    });

    const saveResolver = new appsync.CfnResolver(this, 'SaveMutationResolver', {
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
      compatibleRuntimes: [lambda.Runtime.NODEJS_10_X, lambda.Runtime.NODEJS_14_X]
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
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()
    });

    let subnetSelection: ec2.SubnetSelection = { subnets: [subnet] };
    const listHandlerLambda = new lambda.Function(this, "ListHandler", {
      runtime: lambda.Runtime.NODEJS_10_X,
      timeout: Duration.seconds(60),
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
      securityGroups: [ec2.SecurityGroup.fromSecurityGroupId(this, "lambda-security-gp-rel", securityGroup.securityGroupId)],
      vpcSubnets: subnetSelection,
      role: daxRole
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
      responseMappingTemplate: appsync.MappingTemplate.dynamoDbResultItem()
    });

    generateInitialData(this, commentsTable);
    outputUsefulInfo(this, commentsGraphQLApi)
  }
}

const app = new cdk.App();
new TechnologyLearningAwsAppSyncStack(app, 'TechnologyLearningAwsAppSyncStack');
app.synth();
