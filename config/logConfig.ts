
import * as path from 'path';
import { logConfig } from '../config';

//日志根目录
const baseLogPath = path.resolve(logConfig.basePath);
const level = logConfig.level;

const baseConfig = {
    appenders: {
        stdout: {
            type: 'console',
        },
        console: {
            type: 'console',
        },
        http: {//请求日志
            type: 'dateFile',
            filename: baseLogPath + '/response_',
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true
        },
        logger: {//主日志
            type: 'dateFile',
            filename: baseLogPath + '/logger_',
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true
        },
        error: {//错误日志
            type: 'dateFile',
            filename: baseLogPath + '/error_',
            pattern: 'yyyy-MM-dd.log',
            alwaysIncludePattern: true
        }
    },
    categories: {
        default: { appenders: ['console', 'logger'], level: 'debug' },
        http: { appenders: ['console', 'http'], level: 'debug' },
        stdout: { appenders: ['stdout'], level: 'debug' },
        error: { appenders: ['console', 'error'], level: 'error' }
    }
}
/**
 *  根据不同level输出不同的Logger配置
 */
const levelState = {
    'debug': () => {
        let outConfig = Object.assign(baseConfig);
        let appenders = outConfig.appenders;
        for (let key in appenders) {
            appenders[key]['type'] = 'console';
        }
        outConfig.categories = {
            default: { appenders: ['logger'], level: 'debug' },
            http: { appenders: ['http'], level: 'debug' },
            stdout: { appenders: ['stdout'], level: 'debug' },
            error: { appenders: ['error'], level: 'error' }
        }
        return outConfig
    },
    'watching': () => {
        let outConfig = Object.assign(baseConfig);
        outConfig.categories.http.appenders = ['http'];
        return outConfig;
    },
    'running': () => {
        let outConfig = Object.assign(baseConfig);

        outConfig.categories = {
            default: { appenders: ['logger'], level: 'debug' },
            http: { appenders: ['http'], level: 'debug' },
            error: { appenders: ['error'], level: 'warn' }
        }
        return outConfig
    }
}
const log4jsConfig = levelState[level]();
export default log4jsConfig
