import cdk = require('@aws-cdk/core');
import {
  AuthorizationType,
  CfnApiKey,
  CfnDataSource,
  CfnResolver,
  FieldLogLevel,
  GraphqlApi,
  MappingTemplate,
  Schema,
} from '@aws-cdk/aws-appsync';
import {
  Attribute,
  AttributeType,
  BillingMode,
  ProjectionType,
  StreamViewType,
  Table,
  TableProps,
} from '@aws-cdk/aws-dynamodb';
import { ManagedPolicy, Role, ServicePrincipal } from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from '@aws-cdk/custom-resources';
import { datatype, date, helpers } from 'faker';
import * as fs from 'fs';
import * as Path from 'path';

const Quotes = require('randomquote-api');

function getTextFromFile(path: string) {
  return fs.readFileSync(Path.join(__dirname, path), 'utf-8').toString();
}

const guestbookEvents = ['marriage', 'website-visit', 'inauguration', 'funeral', 'birth', 'baptism'];

function getRandomGuestbookEvent(): string {
  return guestbookEvents[Math.floor(Math.random() * guestbookEvents.length)];
}

interface Comment {
  id: { S: string };
  guestbookId: { S: string };
  createdDate: { S: string };
  author: { S: string };
  message: { S: string };
}

function generateItem(): Comment {
  return {
    id: { S: datatype.uuid() },
    guestbookId: { S: getRandomGuestbookEvent() },
    createdDate: { S: `${date.past(1).toISOString()}` },
    author: { S: helpers.createCard().name },
    message: { S: Quotes.randomQuote().quote },
  };
}

function generateBatch(batchSize = 25): { PutRequest: { Item: Comment } }[] {
  return new Array(batchSize).fill(undefined).map(() => {
    return { PutRequest: { Item: generateItem() } };
  });
}

const responseMappingTemplate = '$util.toJson($ctx.result)';

function outputUsefulInfo(param: any, api: GraphqlApi) {
  // Prints out the AppSync GraphQL endpoint to the terminal
  new cdk.CfnOutput(param, 'GraphQLAPIURL', {
    value: api.graphqlUrl,
  });

  // Prints out the AppSync GraphQL API key to the terminal
  new cdk.CfnOutput(param, 'GraphQLAPIKey', {
    value: api.apiKey || '',
  });

  // Prints out the stack region to the terminal
  new cdk.CfnOutput(param, 'Stack Region', {
    value: param.region,
  });
}

export class TechnologyLearningAwsAppSyncStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    //IAM:
    const guestbookRole = new Role(this, 'GuestbookCommentRole', {
      assumedBy: new ServicePrincipal('appsync.amazonaws.com'),
    });

    guestbookRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'));
    guestbookRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AWSXrayFullAccess'));
    guestbookRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('CloudWatchFullAccess'));

    //AppSync API
    const commentsGraphQLApi = new GraphqlApi(this, 'GuestbookCommentApi', {
      name: 'guestbook-comment-api',
      schema: Schema.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
      logConfig: {
        fieldLogLevel: FieldLogLevel.ALL,
        excludeVerboseContent: false,
        role: guestbookRole,
      },
      xrayEnabled: true,
    });

    new CfnApiKey(this, 'GuestbookCommentApiKey', {
      apiId: commentsGraphQLApi.apiId,
    });

    //DynamoDB Table
    const guestbookIdAttribute: Attribute = {
      name: 'guestbookId',
      type: AttributeType.STRING,
    };

    const createdDateAttribute: Attribute = {
      name: 'createdDate',
      type: AttributeType.STRING,
    };

    let tableProps: TableProps = {
      tableName: 'GuestbookCommentTable',
      partitionKey: guestbookIdAttribute,
      sortKey: createdDateAttribute,
      billingMode: BillingMode.PAY_PER_REQUEST,
      stream: StreamViewType.NEW_IMAGE,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    };

    const commentsTable = new Table(this, `${tableProps.tableName}`, tableProps);

    const idAttribute: Attribute = {
      name: 'id',
      type: AttributeType.STRING,
    };

    let gsiProps = {
      indexName: 'get-and-delete-by-id-gsi',
      partitionKey: idAttribute,
      projectionType: ProjectionType.ALL,
    };
    commentsTable.addGlobalSecondaryIndex(gsiProps);

    //Datasource resolvers:
    const dataSource = new CfnDataSource(this, 'GuestbookCommentDataSource', {
      apiId: commentsGraphQLApi.apiId,
      name: 'GuestbookCommentDynamoDataSource',
      type: 'AMAZON_DYNAMODB',
      dynamoDbConfig: {
        tableName: commentsTable.tableName,
        awsRegion: this.region,
      },
      serviceRoleArn: guestbookRole.roleArn,
    });

    const getAllResolver = new CfnResolver(this, 'GetAllQueryResolver', {
      apiId: commentsGraphQLApi.apiId,
      typeName: 'Query',
      fieldName: 'listGuestbookComments',
      dataSourceName: dataSource.name,
      requestMappingTemplate: MappingTemplate.fromFile('lib/resolvers/listGuestbookComments.vm').renderTemplate(),
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem().renderTemplate(),
    });
    getAllResolver.addDependsOn(dataSource);

    const saveResolver = new CfnResolver(this, 'SaveMutationResolver', {
      apiId: commentsGraphQLApi.apiId,
      typeName: 'Mutation',
      fieldName: 'createGuestbookComment',
      dataSourceName: dataSource.name,
      requestMappingTemplate: getTextFromFile('resolvers/createGuestbookComment.vm'),
      responseMappingTemplate: responseMappingTemplate,
    });
    saveResolver.addDependsOn(dataSource);

    const getHandlerLambda = new lambda.Function(this, 'GetHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambdas'),
      handler: 'get.main',
      environment: {
        TABLE_NAME: commentsTable.tableName,
        GSI_NAME: gsiProps.indexName,
      },
    });
    commentsTable.grantFullAccess(getHandlerLambda);

    let getLambdaDataSource = commentsGraphQLApi.addLambdaDataSource('getHandlerLambdaDatasource', getHandlerLambda);
    getLambdaDataSource.createResolver({
      typeName: 'Query',
      fieldName: 'getGuestbookComment',
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    });

    const deleteHandlerLambda = new lambda.Function(this, 'DeleteHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset('lambdas'),
      handler: 'delete.main',
      environment: {
        TABLE_NAME: commentsTable.tableName,
        GSI_NAME: gsiProps.indexName,
      },
    });
    commentsTable.grantFullAccess(deleteHandlerLambda);

    let deleteLambdaDataSource = commentsGraphQLApi.addLambdaDataSource(
      'deleteHandlerLambdaDatasource',
      deleteHandlerLambda,
    );
    deleteLambdaDataSource.createResolver({
      typeName: 'Mutation',
      fieldName: 'deleteGuestbookComment',
      responseMappingTemplate: MappingTemplate.dynamoDbResultItem(),
    });

    //Add some data:
    this.generateInitialData(commentsTable);

    outputUsefulInfo(this, commentsGraphQLApi);
  }

  private generateInitialData(commentsTable: Table) {
    for (let i = 0; i < 10; i++) {
      new AwsCustomResource(this, `initDBResourceBatch${i}`, {
        onCreate: {
          service: 'DynamoDB',
          action: 'batchWriteItem',
          parameters: {
            RequestItems: {
              [commentsTable.tableName]: generateBatch(),
            },
          },
          physicalResourceId: PhysicalResourceId.of(`initDBDataBatch${i}`),
        },
        policy: AwsCustomResourcePolicy.fromSdkCalls({ resources: [commentsTable.tableArn] }),
      });
    }
  }
}

const app = new cdk.App();
new TechnologyLearningAwsAppSyncStack(app, 'TechnologyLearningAwsAppSyncStack');
app.synth();
