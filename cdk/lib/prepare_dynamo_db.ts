import {
  Attribute,
  AttributeType,
  BillingMode,
  ProjectionType,
  StreamViewType,
  Table,
  TableProps
} from "@aws-cdk/aws-dynamodb";
import { TechnologyLearningAwsAppSyncStack } from "./technology_learning-aws_app_sync_stack-stack";
import cdk = require('@aws-cdk/core');

export function prepareDynamoDb(stack: TechnologyLearningAwsAppSyncStack) {
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

  const commentsTable = new Table(stack, `${tableProps.tableName}`, tableProps);

  const idAttribute: Attribute = {
    name: 'id',
    type: AttributeType.STRING
  };

  let gsiProps = {
    indexName: "get-and-delete-by-id-gsi",
    partitionKey: idAttribute,
    projectionType: ProjectionType.ALL
  };
  commentsTable.addGlobalSecondaryIndex(gsiProps)


  return { commentsTable, gsiProps };
}
