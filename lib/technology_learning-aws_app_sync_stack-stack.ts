import cdk = require('@aws-cdk/core');
import {CfnApiKey, CfnDataSource, CfnGraphQLApi, CfnGraphQLSchema, CfnResolver} from '@aws-cdk/aws-appsync';
import {Attribute, AttributeType, BillingMode, StreamViewType, Table, TableProps} from '@aws-cdk/aws-dynamodb';
import {ManagedPolicy, Role, ServicePrincipal} from '@aws-cdk/aws-iam';
import {datatype, date, helpers} from 'faker';
import {AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId} from '@aws-cdk/custom-resources';
import * as fs from 'fs';
import * as Path from "path";

const Quotes = require('randomquote-api')

function getTextFromFile(path: string) {
    return fs.readFileSync(Path.join(__dirname, path), 'utf-8').toString();
}

const guestbookEvents = [
    'marriage',
    'website-visit',
    'inauguration',
    'funeral',
    'birth',
    'baptism',
];

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
        id: {S: datatype.uuid()},
        guestbookId: {S: getRandomGuestbookEvent()},
        createdDate: {S: `${date.past(1).toISOString()}`},
        author: {S: helpers.createCard().name},
        message: {S: Quotes.randomQuote().quote}
    };
}

function generateBatch(batchSize = 25): { PutRequest: { Item: Comment } }[] {
    return new Array(batchSize).fill(undefined).map(() => {
        return {PutRequest: {Item: generateItem()}};
    });
}

const responseMappingTemplate = '$util.toJson($ctx.result)';

export class TechnologyLearningAwsAppSyncStack extends cdk.Stack {

    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        //IAM:
        const guestbookRole = new Role(this, 'GuestbookCommentRole', {
            assumedBy: new ServicePrincipal('appsync.amazonaws.com')
        });

        guestbookRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'));
        guestbookRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AWSXrayFullAccess'));
        guestbookRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('CloudWatchFullAccess'));

        //AppSync API
        const commentsGraphQLApi = new CfnGraphQLApi(this, 'GuestbookCommentApi', {
            name: 'guestbook-comment-api',
            authenticationType: 'API_KEY',
            logConfig: {
                cloudWatchLogsRoleArn: guestbookRole.roleArn,
                fieldLogLevel: 'All'
            },
            xrayEnabled: true
        });

        new CfnApiKey(this, 'GuestbookCommentApiKey', {
            apiId: commentsGraphQLApi.attrApiId
        });

        const cfnGraphQLSchema = new CfnGraphQLSchema(this, 'GuestbookCommentSchema', {
            apiId: commentsGraphQLApi.attrApiId,
            definition: getTextFromFile('schema.graphql')
        });

        //DynamoDB Table
        const guestbookIdAttribute: Attribute = {
            name: 'guestbookId',
            type: AttributeType.STRING
        };

        const createdDateAttribute: Attribute = {
            name: 'createdDate',
            type: AttributeType.STRING
        };

        let tableProps: TableProps = {
            tableName: 'GuestbookCommentTable',
            partitionKey: guestbookIdAttribute,
            sortKey: createdDateAttribute,
            billingMode: BillingMode.PAY_PER_REQUEST,
            stream: StreamViewType.NEW_IMAGE,
            removalPolicy: cdk.RemovalPolicy.DESTROY
        };

        const commentsTable = new Table(this, `${tableProps.tableName}`, tableProps);

        //Datasource resolvers:
        const dataSource = new CfnDataSource(this, 'GuestbookCommentDataSource', {
            apiId: commentsGraphQLApi.attrApiId,
            name: 'GuestbookCommentDynamoDataSource',
            type: 'AMAZON_DYNAMODB',
            dynamoDbConfig: {
                tableName: commentsTable.tableName,
                awsRegion: this.region,
            },
            serviceRoleArn: guestbookRole.roleArn
        });

        const getOneResolver = new CfnResolver(this, 'GetOneQueryResolver', {
            apiId: commentsGraphQLApi.attrApiId,
            typeName: 'Query',
            fieldName: 'getGuestbookComment',
            dataSourceName: dataSource.name,
            requestMappingTemplate: getTextFromFile('resolvers/getGuestbookComment.vm'),
            responseMappingTemplate: responseMappingTemplate
        });
        getOneResolver.addDependsOn(cfnGraphQLSchema);
        getOneResolver.addDependsOn(dataSource);

        const getAllResolver = new CfnResolver(this, 'GetAllQueryResolver', {
            apiId: commentsGraphQLApi.attrApiId,
            typeName: 'Query',
            fieldName: 'listGuestbookComments',
            dataSourceName: dataSource.name,
            requestMappingTemplate: getTextFromFile('resolvers/listGuestbookComments.vm'),
            responseMappingTemplate: responseMappingTemplate
        });
        getAllResolver.addDependsOn(cfnGraphQLSchema);
        getAllResolver.addDependsOn(dataSource);

        const saveResolver = new CfnResolver(this, 'SaveMutationResolver', {
            apiId: commentsGraphQLApi.attrApiId,
            typeName: 'Mutation',
            fieldName: 'createGuestbookComment',
            dataSourceName: dataSource.name,
            requestMappingTemplate: getTextFromFile('resolvers/createGuestbookComment.vm'),
            responseMappingTemplate: responseMappingTemplate
        });
        saveResolver.addDependsOn(cfnGraphQLSchema);
        saveResolver.addDependsOn(dataSource);

        const updateResolver = new CfnResolver(this, 'UpdateMutationResolver', {
            apiId: commentsGraphQLApi.attrApiId,
            typeName: 'Mutation',
            fieldName: 'updateGuestbookComment',
            dataSourceName: dataSource.name,
            requestMappingTemplate: getTextFromFile('resolvers/updateGuestbookComment.vm'),
            responseMappingTemplate: responseMappingTemplate
        });
        updateResolver.addDependsOn(cfnGraphQLSchema);
        updateResolver.addDependsOn(dataSource);

        const deleteResolver = new CfnResolver(this, 'DeleteMutationResolver', {
            apiId: commentsGraphQLApi.attrApiId,
            typeName: 'Mutation',
            fieldName: 'deleteGuestbookComment',
            dataSourceName: dataSource.name,
            requestMappingTemplate: getTextFromFile('resolvers/deleteGuestbookComment.vm'),
            responseMappingTemplate: responseMappingTemplate
        });
        deleteResolver.addDependsOn(cfnGraphQLSchema);
        deleteResolver.addDependsOn(dataSource);

        //Add some data:
        this.generateInitialData(commentsTable);
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
                policy: AwsCustomResourcePolicy.fromSdkCalls({resources: [commentsTable.tableArn]}),
            });
        }
    }
}

const app = new cdk.App();
new TechnologyLearningAwsAppSyncStack(app, 'TechnologyLearningAwsAppSyncStack');
app.synth();
