const path = require('path');

//日志根目录
const baseLogPath = path.resolve(__dirname, '../logs')
//错误日志目录
const errorPath = "/";
//错误日志文件名
const errorFileName = "error_";
//错误日志输出完整路径
const errorLogPath = baseLogPath + errorPath + "/" + errorFileName;
// const errorLogPath = path.resolve(__dirname, "../logs/error/error");
 

//响应日志目录
const responsePath = "/";
//响应日志文件名
const responseFileName = "response_";
//响应日志输出完整路径
const responseLogPath = baseLogPath + responsePath + "/" + responseFileName;
// const responseLogPath = path.resolve(__dirname, "../logs/response/response");

module.exports = {
    replaceConsole: true,
    appenders: {
        stdout: {//控制台输出
            type: 'console',
        },
        console:{
            type:'console'
        },
        response: {//请求日志
            type: 'dateFile',
            filename: responseLogPath,
            pattern: 'req-yyyy-MM-dd.log',
            alwaysIncludePattern: true
        },
        error: {//错误日志
            type: 'dateFile',
            filename: errorLogPath,
            pattern: 'err-yyyy-MM-dd.log',
            alwaysIncludePattern: true
        }
    },
    categories: {
        default: { appenders: ['console','response'], level: 'debug' },
        stdout: { appenders: ['stdout'], level: 'debug' },//appenders:采用的appender,取appenders项,level:设置级别
        error: { appenders: ['console','error'], level: 'error' }
    },
    "baseLogPath": baseLogPath                  //logs根目录
}
