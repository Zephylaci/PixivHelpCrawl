process.env.http_proxy = '';
process.env.https_proxy = '';
process.env.no_proxy = '*';

import * as dotenv from 'dotenv';
dotenv.config();

const service = require('./server/http-service');
