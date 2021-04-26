import { AppSyncResolverHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';
import { ScanInput } from 'aws-sdk/clients/dynamodb';
import { TableGuestbookCommentFilterInput } from 'generic-stuff/dist/types/TableGuestbookCommentFilterInput';
import { GuestbookComment } from 'generic-stuff/dist/types/GuestbookComment';
import { convertAttributeMapCollectionToCommentCollection } from 'generic-stuff/dist/util/Conversor';

import * as AmazonDaxClient from 'amazon-dax-client';

export const handler: AppSyncResolverHandler<TableGuestbookCommentFilterInput, { items: GuestbookComment[] }> = async (
  event,
) => {
  try {
    // console.log({ commentFilterInput });
    console.log({ env: process.env });
    console.log(event);

    const region = 'us-east-1';

    AWS.config.update({
      region,
    });

    // const ddbClient = new AWS.DynamoDB.DocumentClient();
    console.log('creating dax');
    const dax = new AmazonDaxClient({ endpoints: [process.env.DAX_URL || ''], region });
    console.log('creating daxClient');
    const daxClient = new AWS.DynamoDB.DocumentClient({ service: dax });

    const filterExpression = undefined;
    const expressionAttributeValues = undefined;

    console.log({ daxClient, dax });

    const params: ScanInput = {
      TableName: process.env.TABLE_NAME || '',
      Limit: 20, // TODO!!!
      ExpressionAttributeValues: expressionAttributeValues,
      FilterExpression: filterExpression,
    };

    console.log('calling scan');
    const data = await daxClient.scan(params).promise();
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
};
