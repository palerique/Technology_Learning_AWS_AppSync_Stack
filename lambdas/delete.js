const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.main = async function (event, context) {
    try {
        let params = {
            TableName: process.env.TABLE_NAME,
            IndexName: process.env.GSI_NAME,
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
                ":id": event.arguments.input.id
            },
        };
        const data = await dynamoDB.query(params).promise();
        let body = {
            Item: data
        };
        let stringify = JSON.stringify(body);
        console.log(stringify);

        const {createdDate, guestbookId} = data.Items[0];
        let deleteParams = {
            TableName: process.env.TABLE_NAME,
            Key: {
                guestbookId,
                createdDate,
            }
        };

        const result = await dynamoDB.delete(deleteParams).promise()
        console.log(result);

        return data.Items[0];
    } catch (error) {
        const body = error.stack || JSON.stringify(error, null, 2);
        console.error('ERROR!!!', body)
        return {
            statusCode: 400,
            headers: {},
            body: JSON.stringify(body)
        }
    }
}
