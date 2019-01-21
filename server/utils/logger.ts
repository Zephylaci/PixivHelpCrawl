import * as log4js from 'log4js'
import  log4jsConfig from '../../config/logConfig'
//加载配置文件
log4js.configure(log4jsConfig);

export let logger = log4js.getLogger('logger')
export let loggerRes = log4js.getLogger('http')
export let loggerErr = log4js.getLogger('error')
export let loggerShow = log4js.getLogger('stdout')

let logUtil = {
    logger,
    loggerRes,
    loggerErr,
    loggerShow,
}


export default logUtil;
