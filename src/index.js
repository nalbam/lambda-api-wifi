'use strict';

const create = require('./wifi/create').create;
const update = require('./wifi/update').update;
const scan = require('./wifi/scan').scan;
const get = require('./wifi/get').get;

exports.handler = (event, context, callback) => {
    console.log('## handler event : ', JSON.stringify(event, null, 2));

    const path = event.path; // /wifi
    const method = event.httpMethod; // POST, PUT, GET

    const arr = path.split('/');
    if (arr.length !== 2 || arr[1] !== 'wifi') {
        callback(new Error(`Unrecognized path "${path}"`));
    }

    if (method === 'POST') {
        create(event, context, callback);
    } else if (method === 'PUT') {
        update(event, context, callback);
    } else if (method === 'GET') {
        scan(event, context, callback);
    } else {
        callback(new Error(`Unrecognized method "${method}"`));
    }
};
