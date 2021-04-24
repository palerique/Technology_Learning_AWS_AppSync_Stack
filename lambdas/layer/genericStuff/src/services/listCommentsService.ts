import * as AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import { TableGuestbookCommentFilterInput } from '../types/TableGuestbookCommentFilterInput';
import { GuestbookComment } from '../types/GuestbookComment';
import { convertAttributeMapCollectionToCommentCollection } from '../util/Conversor';
import ScanInput = DocumentClient.ScanInput;

const AmazonDaxClient = require('amazon-dax-client');

export async function listComments(
  commentFilterInput: TableGuestbookCommentFilterInput,
): Promise<{ items: GuestbookComment[] }> {
  try {
    console.log({ commentFilterInput });
    console.log({ env: process.env });

    const region = 'us-east-1';

    AWS.config.update({
      region,
    });

    const ddbClient = new AWS.DynamoDB.DocumentClient();
    const dax = new AmazonDaxClient({ endpoints: [process.env.DAX_URL], region });
    const daxClient = new AWS.DynamoDB.DocumentClient({ service: dax });
    const client = daxClient != null ? daxClient : ddbClient;

    const filterExpression = undefined;
    const expressionAttributeValues = undefined;

    console.log({ client, daxClient, dax, ddbClient });

    const params: ScanInput = {
      TableName: process.env.TABLE_NAME || '',
      Limit: commentFilterInput?.input?.limit || 20,
      ExpressionAttributeValues: expressionAttributeValues,
      FilterExpression: filterExpression,
    };

    const data = await client.scan(params).promise();
    console.log({ data });

    let result: GuestbookComment[];

    if (!data.Items || data.Items.length === 0) {
      result = [];
    } else {
      result = convertAttributeMapCollectionToCommentCollection(data.Items);
    }

    console.log({ result });

    return { items: result };
  } catch (error) {
    const body = error.stack || JSON.stringify(error, null, 2);
    console.error('ERROR!!!', body);
    throw error;
  }
}
