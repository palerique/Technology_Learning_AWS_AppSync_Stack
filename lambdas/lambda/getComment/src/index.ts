import { AppSyncResolverHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { GetGuestbookCommentInput } from 'generic-stuff/dist/types/GetGuestbookCommentInput';
import { GuestbookComment } from 'generic-stuff/dist/types/GuestbookComment';
import { convertAttributeMapToComment } from 'generic-stuff/dist/util/Conversor';

const dynamoDB = new AWS.DynamoDB.DocumentClient();

export const handler: AppSyncResolverHandler<GetGuestbookCommentInput, GuestbookComment> = async (event) => {
  try {
    const data = await dynamoDB
      .query({
        TableName: process.env.TABLE_NAME || '',
        IndexName: process.env.GSI_NAME,
        KeyConditionExpression: 'id = :id',
        ExpressionAttributeValues: {
          ':id': event.arguments.id,
        },
      })
      .promise();

    if (!data.Items || data.Items.length === 0) {
      throw new Error('Result set contains no items');
    }

    return convertAttributeMapToComment(data.Items[0]);
  } catch (error) {
    const body = error.stack || JSON.stringify(error, null, 2);
    console.error('ERROR!!!', body);
    throw error;
  }
};
