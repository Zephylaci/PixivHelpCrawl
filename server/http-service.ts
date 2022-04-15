#!/usr/bin/env node

// 启动koa 服务器
/**
 * Module dependencies.
 */

import app from './module/koa-service';
import * as http from 'http';
import { loggerShow, loggerErr } from './utils/logger';
//引入配置文件
import env from '../config';
// 将端口号设置为配置文件的端口号，默认值为3000,dev,test默认端口3001
const host = env.host || '0.0.0.0';
const port = normalizePort(env.port || '3000');
// 打印输出端口号

const server = http.createServer(app.callback());
server.listen(port, host);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            loggerShow.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            loggerShow.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    loggerShow.info('Listening on: ' + bind);
}

export default {};
