'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const uuid = require('uuid');
const moment = require('moment');

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

    // Unknown
    if (!data.desc || data.desc === '(Unknown)') {
        data.desc = '-';
    }

    const params = {
        TableName: process.env.MAIN_TABLE,
        Key: {
            mac: data.mac,
        },
    };

    // get wifi-main
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
                    beacon: data.beacon,
                    checked: false,
                    createdAt: timestamp,
                },
            };

            // put wifi-main
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

                // response
                console.log('wifi-main saved. ', params.Item);
                const response = {
                    statusCode: 200,
                    body: JSON.stringify(params.Item),
                };
                callback(null, response);
            });
        } else {
            if (result.Item.beacon !== data.beacon || result.Item.ip !== data.ip) {
                const params = {
                    TableName: process.env.MAIN_TABLE,
                    Key: {
                        mac: data.mac,
                    },
                    UpdateExpression: 'SET beacon = :beacon, ip = :ip, updatedAt = :updatedAt',
                    ExpressionAttributeValues: {
                        ':ip': data.ip,
                        ':beacon': data.beacon,
                        ':updatedAt': timestamp,
                    },
                    ReturnValues: 'ALL_NEW',
                };

                // update wifi-main
                dynamoDb.update(params, (error, result) => {
                    // handle potential errors
                    if (error) {
                        console.error(error);
                    }
                    console.log(`"${data.mac}" : "${result}"`);
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
                const datetime = moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm');

                const params = {
                    TableName: process.env.SCAN_TABLE,
                    Item: {
                        id: uuid.v1(),
                        mac: data.mac,
                        ip: data.ip,
                        desc: result.Item.desc,
                        beacon: data.beacon,
                        datetime: datetime,
                        createdAt: timestamp,
                    },
                };

                // put wifi-scan
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

                    // response
                    console.log('wifi-scan saved. ', params.Item);
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
