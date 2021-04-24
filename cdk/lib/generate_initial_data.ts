import { Table } from "@aws-cdk/aws-dynamodb";
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from "@aws-cdk/custom-resources";
import { TechnologyLearningAwsAppSyncStack } from "./technology_learning-aws_app_sync_stack-stack";
import { Comment } from "./comment";
import { datatype, date, helpers } from "faker";

const Quotes = require('randomquote-api')

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

function generateItem(): Comment {
  return {
    id: { S: datatype.uuid() },
    guestbookId: { S: getRandomGuestbookEvent() },
    createdDate: { S: `${date.past(1).toISOString()}` },
    author: { S: helpers.createCard().name },
    message: { S: Quotes.randomQuote().quote }
  };
}

function generateBatch(batchSize = 25): { PutRequest: { Item: Comment } }[] {
  return new Array(batchSize).fill(undefined).map(() => {
    return { PutRequest: { Item: generateItem() } };
  });
}

export function generateInitialData(stack: TechnologyLearningAwsAppSyncStack, commentsTable: Table) {
  for (let i = 0; i < 10; i++) {
    new AwsCustomResource(stack, `initDBResourceBatch${i}`, {
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
