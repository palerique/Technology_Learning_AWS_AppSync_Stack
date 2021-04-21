import { AppSyncResolverHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { TableGuestbookCommentFilterInput } from 'generic-stuff/dist/types/TableGuestbookCommentFilterInput';
import { GuestbookComment } from 'generic-stuff/dist/types/GuestbookComment';
import { convertAttributeMapCollectionToCommentCollection } from 'generic-stuff/dist/util/Conversor';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler: AppSyncResolverHandler<TableGuestbookCommentFilterInput, GuestbookComment[]> = async (event) => {
  try {
    console.log('event', event);

    const data = await dynamoDB
      .scan({
        TableName: process.env.TABLE_NAME || '',
        Limit: event.arguments.input.limit || 20,
      })
      .promise();

    console.log('data', data);
    let result: GuestbookComment[];

    if (!data.Items || data.Items.length === 0) {
      result = [];
    } else {
      result = convertAttributeMapCollectionToCommentCollection(data.Items);
    }

    console.log('result', result);

    return result;
  } catch (error) {
    const body = error.stack || JSON.stringify(error, null, 2);
    console.error('ERROR!!!', body);
    throw error;
  }
};
