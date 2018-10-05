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

        const timestamp = new Date().getTime();

        if (!result || !result.Item) {
            const params = {
                TableName: process.env.MAIN_TABLE,
                Item: {
                    mac: data.mac,
                    ip: data.ip,
                    desc: data.desc,
                    checked: false,
                    createdAt: timestamp,
                },
            };

            // write the wifi-main to the database
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
                console.log('saved. ', params.Item);
                const response = {
                    statusCode: 200,
                    body: JSON.stringify(params.Item),
                };
                callback(null, response);
            });
        } else {
            if (result.Item.ip && result.Item.ip !== data.ip) {
                const params = {
                    TableName: process.env.MAIN_TABLE,
                    Key: {
                        mac: data.mac,
                    },
                    UpdateExpression: 'SET ip = :ip, desc = :desc, updatedAt = :updatedAt',
                    ExpressionAttributeValues: {
                        ':ip': data.ip,
                        ':desc': data.desc,
                        ':updatedAt': timestamp,
                    },
                    ReturnValues: 'ALL_NEW',
                };

                // update the wifi-main in the database
                dynamoDb.update(params, (error, result) => {
                    // handle potential errors
                    if (error) {
                        console.error(error);
                    }
                    console.log(`"${data.mac}" : "${data.ip}"`);
                });
            }

            if (result.Item.checked === false) {
                // response
                console.log(`"${data.mac}" is false`);
                callback(null, {
                    statusCode: 200,
                    body: {
                        body: `"${data.mac}" is false`
                    },
                });
            } else {
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
                    console.log('saved. ', params.Item);
                    const response = {
                        statusCode: 200,
                        body: JSON.stringify(params.Item),
                    };
                    callback(null, response);
                });
            }
        }
    });
};
