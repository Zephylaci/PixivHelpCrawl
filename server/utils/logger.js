const log4js = require('log4js');
const log_config = require('../../config/logConfig');


//加载配置文件
log4js.configure(log_config);

let resLogger = log4js.getLogger('response')
let loggerErr = log4js.getLogger('error')
let loggerShow = log4js.getLogger('stdout')
let logUtil = {
    logger:resLogger,
    loggerErr,
    loggerShow,
}


module.exports = logUtil;

