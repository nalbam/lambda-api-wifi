'use strict';

const AWS = require('aws-sdk');
const moment = require('moment-timezone');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.scan = (event, context, callback) => {
    const data = event.queryStringParameters;

    let params;

    if (data && data.mac && typeof data.mac === 'string') {
        if (!data.time_zone) {
            data.time_zone = 'Asia/Seoul';
        }
        if (!data.scan_date) {
            data.scan_date = moment().tz(data.time_zone).format('YYYY-MM-DD');
        }

        params = {
            TableName: process.env.SCN_TABLE,
            FilterExpression: 'mac = :mac and scan_date :date1 and :date2',
            ExpressionAttributeValues: {
                ':mac': data.mac,
                ':date1': `${data.scan_date} 00:00`,
                ':date2': `${data.scan_date} 24:00`,
            },
        };
    } else {
        params = {
            TableName: process.env.MAC_TABLE,
        };
    }

    // fetch all wifi-scn from the database
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
