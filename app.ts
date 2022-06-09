process.env.http_proxy = '';
process.env.https_proxy = '';
process.env.no_proxy = '*';

const service = require('./server/http-service');
