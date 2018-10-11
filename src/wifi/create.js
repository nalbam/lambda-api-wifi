'use strict';

const AWS = require('aws-sdk');
const uuid = require('uuid');
const moment = require('moment-timezone');

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
        TableName: process.env.MAC_TABLE,
        Key: {
            mac: data.mac,
        },
    };

    // get wifi-mac
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
            if (!data.time_zone) {
                data.time_zone = 'Asia/Seoul';
            }

            const params = {
                TableName: process.env.MAC_TABLE,
                Item: {
                    mac: data.mac,
                    ip: data.ip,
                    desc: data.desc,
                    beacon: data.beacon,
                    time_zone: data.time_zone,
                    checked: false,
                    create_time: timestamp,
                },
            };

            // put wifi-mac
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
                console.log('wifi-mac saved. ', params.Item);
                const response = {
                    statusCode: 200,
                    body: JSON.stringify(params.Item),
                };
                callback(null, response);
            });
        } else {
            if (result.Item.beacon !== data.beacon || result.Item.ip !== data.ip) {
                const params = {
                    TableName: process.env.MAC_TABLE,
                    Key: {
                        mac: data.mac,
                    },
                    UpdateExpression: 'SET beacon = :beacon, ip = :ip, update_time = :update_time',
                    ExpressionAttributeValues: {
                        ':ip': data.ip,
                        ':beacon': data.beacon,
                        ':update_time': timestamp,
                    },
                    ReturnValues: 'ALL_NEW',
                };

                // update wifi-mac
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
                const scan_date = moment().tz(result.Item.time_zone).format('YYYY-MM-DD HH:mm');

                const params = {
                    TableName: process.env.SCN_TABLE,
                    Item: {
                        id: uuid.v1(),
                        mac: data.mac,
                        ip: data.ip,
                        desc: result.Item.desc,
                        beacon: data.beacon,
                        scan_date: scan_date,
                        create_time: timestamp,
                    },
                };

                // put wifi-scn
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
                    console.log('wifi-scn saved. ', params.Item);
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
