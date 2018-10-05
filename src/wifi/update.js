'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.update = (event, context, callback) => {
    const data = JSON.parse(event.body);
    if (typeof data.mac !== 'string' || typeof data.name !== 'string' || typeof data.checked !== 'boolean') {
        console.error('Validation Failed.');
        callback(null, {
            statusCode: 400,
            body: {
                error: 'Validation Failed.'
            },
        });
        return;
    }

    const timestamp = new Date().getTime();

    const params = {
        TableName: process.env.MAIN_TABLE,
        Key: {
            mac: data.mac,
        },
        UpdateExpression: 'SET name = :name, checked = :checked, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
            ':name': data.name,
            ':checked': data.checked,
            ':updatedAt': timestamp,
        },
        ReturnValues: 'ALL_NEW',
    };

    // update the wifi-main in the database
    dynamoDb.update(params, (error, result) => {
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
            body: JSON.stringify(result.Attributes),
        };
        callback(null, response);
    });
};
