'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.create = (event, context, callback) => {
    const data = JSON.parse(event.body);
    if (typeof data.mac !== 'string') {
        console.error('Validation Failed.');
        callback(null, {
            statusCode: 400,
            body: {
                error: 'Validation Failed.'
            },
        });
        return;
    }

    const params = {
        TableName: process.env.MAIN_TABLE,
        Key: {
            mac: data.mac,
        },
    };

    // fetch wifi-main from the database
    dynamoDb.get(params, (error, result) => {
        // handle potential errors
        if (error) {
            console.error(error);
            callback(null, {
                statusCode: error.statusCode || 501,
                body: error,
            });
            return;
        }

        if (result && result.Item && result.Item.checked === true) {
            const timestamp = new Date().getTime();

            const params = {
                TableName: process.env.SCAN_TABLE,
                Item: {
                    id: uuid.v1(),
                    mac: data.mac,
                    ip: data.ip,
                    desc: data.desc,
                    createdAt: timestamp,
                },
            };

            // write the wifi-scan to the database
            dynamoDb.put(params, (error) => {
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
                console.log('Success.');
                const response = {
                    statusCode: 200,
                    body: JSON.stringify(params.Item),
                };
                callback(null, response);
            });
        } else {
            // response
            console.error(`"${data.mac}" is false`);
            callback(null, {
                statusCode: 400,
                body: {
                    error: `"${data.mac}" is false`
                },
            });
        }
    });
};
