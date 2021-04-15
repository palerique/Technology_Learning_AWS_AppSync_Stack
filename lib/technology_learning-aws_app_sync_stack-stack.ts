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

const graphQlSchema: string = getTextFromFile('schema.graphql');
const updateGuestbookCommentVm: string = getTextFromFile('resolvers/updateGuestbookComment.vm');
const createGuestbookCommentVm: string = getTextFromFile('resolvers/createGuestbookComment.vm');
const deleteGuestbookCommentVm: string = getTextFromFile('resolvers/deleteGuestbookComment.vm');
const getGuestbookCommentVm: string = getTextFromFile('resolvers/getGuestbookComment.vm');
const listGuestbookCommentsVm: string = getTextFromFile('resolvers/listGuestbookComments.vm');

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
    createdDate: { S: string }
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

        const commentsGraphQLApi = new CfnGraphQLApi(this, 'GuestbookCommentApi', {
            name: 'guestbook-comment-api',
            authenticationType: 'API_KEY'
        });

        new CfnApiKey(this, 'GuestbookCommentApiKey', {
            apiId: commentsGraphQLApi.attrApiId
        });

        const cfnGraphQLSchema = new CfnGraphQLSchema(this, 'GuestbookCommentSchema', {
            apiId: commentsGraphQLApi.attrApiId,
            definition: graphQlSchema
        });

        const idAttribute: Attribute = {
            name: 'id',
            type: AttributeType.STRING
        };

        const createdDateAttribute: Attribute = {
            name: 'createdDate',
            type: AttributeType.NUMBER
        };

        let tableProps: TableProps = {
            tableName: 'GuestbookCommentTable',
            partitionKey: idAttribute,
            sortKey: createdDateAttribute,
            billingMode: BillingMode.PAY_PER_REQUEST,
            stream: StreamViewType.NEW_IMAGE,
            removalPolicy: cdk.RemovalPolicy.DESTROY
        };

        const commentsTable = new Table(this, `${tableProps.tableName}`, tableProps);

        const commentsTableRole = new Role(this, 'GuestbookCommentDynamoDBRole', {
            assumedBy: new ServicePrincipal('appsync.amazonaws.com')
        });

        commentsTableRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'));

        const dataSource = new CfnDataSource(this, 'GuestbookCommentDataSource', {
            apiId: commentsGraphQLApi.attrApiId,
            name: 'GuestbookCommentDynamoDataSource',
            type: 'AMAZON_DYNAMODB',
            dynamoDbConfig: {
                tableName: commentsTable.tableName,
                awsRegion: this.region,
            },
            serviceRoleArn: commentsTableRole.roleArn
        });

        const getOneResolver = new CfnResolver(this, 'GetOneQueryResolver', {
            apiId: commentsGraphQLApi.attrApiId,
            typeName: 'Query',
            fieldName: 'getGuestbookComment',
            dataSourceName: dataSource.name,
            requestMappingTemplate: getGuestbookCommentVm,
            responseMappingTemplate: responseMappingTemplate
        });
        getOneResolver.addDependsOn(cfnGraphQLSchema);
        getOneResolver.addDependsOn(dataSource);

        const getAllResolver = new CfnResolver(this, 'GetAllQueryResolver', {
            apiId: commentsGraphQLApi.attrApiId,
            typeName: 'Query',
            fieldName: 'listGuestbookComments',
            dataSourceName: dataSource.name,
            requestMappingTemplate: listGuestbookCommentsVm,
            responseMappingTemplate: responseMappingTemplate
        });
        getAllResolver.addDependsOn(cfnGraphQLSchema);
        getAllResolver.addDependsOn(dataSource);

        const saveResolver = new CfnResolver(this, 'SaveMutationResolver', {
            apiId: commentsGraphQLApi.attrApiId,
            typeName: 'Mutation',
            fieldName: 'createGuestbookComment',
            dataSourceName: dataSource.name,
            requestMappingTemplate: createGuestbookCommentVm,
            responseMappingTemplate: responseMappingTemplate
        });
        saveResolver.addDependsOn(cfnGraphQLSchema);
        saveResolver.addDependsOn(dataSource);

        const updateResolver = new CfnResolver(this, 'UpdateMutationResolver', {
            apiId: commentsGraphQLApi.attrApiId,
            typeName: 'Mutation',
            fieldName: 'updateGuestbookComment',
            dataSourceName: dataSource.name,
            requestMappingTemplate: updateGuestbookCommentVm,
            responseMappingTemplate: responseMappingTemplate
        });
        updateResolver.addDependsOn(cfnGraphQLSchema);
        updateResolver.addDependsOn(dataSource);

        const deleteResolver = new CfnResolver(this, 'DeleteMutationResolver', {
            apiId: commentsGraphQLApi.attrApiId,
            typeName: 'Mutation',
            fieldName: 'deleteGuestbookComment',
            dataSourceName: dataSource.name,
            requestMappingTemplate: deleteGuestbookCommentVm,
            responseMappingTemplate: responseMappingTemplate
        });
        deleteResolver.addDependsOn(cfnGraphQLSchema);
        deleteResolver.addDependsOn(dataSource);

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
                            ['GuestbookComment']: generateBatch(),
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
