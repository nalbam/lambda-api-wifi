'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.scan = (event, context, callback) => {
    const data = event.queryStringParameters;

    let params;

    if (typeof data.mac !== 'string') {
        params = {
            TableName: process.env.MAIN_TABLE,
        };
    } else {
        params = {
            TableName: process.env.SCAN_TABLE,
            FilterExpression: 'mac = :mac',
            ExpressionAttributeValues: {
                ':mac': data.mac,
            },
        };
    }

    // fetch all wifi-scan from the database
    dynamoDb.scan(params, (error, result) => {
        // handle potential errors
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                body: error,
            });
            return;
        }

        // create a response
        const response = {
            statusCode: 200,
            body: JSON.stringify(result.Items),
        };
        callback(null, response);
    });
};
