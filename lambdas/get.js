const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.main = async function (event, context, callback) {
    try {
        const data = await dynamoDB.query({
            TableName: process.env.TABLE_NAME,
            IndexName: process.env.GSI_NAME,
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
                ":id": event.arguments.id
            },
        }).promise();
        const [retrieved] = data.Items;
        callback(null, retrieved)
    } catch (error) {
        const body = error.stack || JSON.stringify(error, null, 2);
        console.error('ERROR!!!', body)
        callback('ERROR!!!', body);
    }
}
