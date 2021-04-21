import { AppSyncResolverHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { TableGuestbookCommentFilterInput } from 'generic-stuff/dist/types/TableGuestbookCommentFilterInput';
import { GuestbookComment } from 'generic-stuff/dist/types/GuestbookComment';
import { convertAttributeMapCollectionToCommentCollection } from 'generic-stuff/dist/util/Conversor';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';
import ScanInput = DocumentClient.ScanInput;

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler: AppSyncResolverHandler<TableGuestbookCommentFilterInput, { items: GuestbookComment[] }> = async (
  event,
) => {
  try {
    console.log('event', event);

    // const filterExpression = 'visible = :visible AND portfolio = :portfolio';
    const filterExpression = undefined;
    // const expressionAttributeValues = {
    //   ':visible': true, // Return only visible offers
    //   ':portfolio': '0001',
    // };
    const expressionAttributeValues = undefined;

    const params: ScanInput = {
      TableName: process.env.TABLE_NAME || '',
      Limit: event.arguments?.input?.limit || 20,
      ExpressionAttributeValues: expressionAttributeValues,
      FilterExpression: filterExpression,
    };

    const data = await dynamoDB.scan(params).promise();

    console.log('data', data);
    let result: GuestbookComment[];

    if (!data.Items || data.Items.length === 0) {
      result = [];
    } else {
      result = convertAttributeMapCollectionToCommentCollection(data.Items);
    }

    console.log('result', result);

    return { items: result };
  } catch (error) {
    const body = error.stack || JSON.stringify(error, null, 2);
    console.error('ERROR!!!', body);
    throw error;
  }
};
