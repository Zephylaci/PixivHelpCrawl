/*
* 所有的页面引用在此管理
 */

const servicePath = '../';
const manPath = '../../../';

let pathAddress = {
    StringTool: servicePath + 'utils/stringTool.js',
    checkImg: servicePath + 'utils/checkImg.js',
    request: servicePath + 'utils/customRequest.js',
    imgFilter: servicePath + 'utils/imgFilter.js',

    downloadImg: servicePath + 'service/downloadImg.js',
    downloadThread: servicePath + 'service/downloadThread.js',
    pixivDownloadControl: servicePath + 'service/pixivDownloadControl.js',
    getHtmlData: servicePath + 'service/getHtmlData.js',
    getPixivData: servicePath + 'service/getPixivData.js',
    handlePixivHotList: servicePath + 'service/handlePixivHotList.js',


    cp: 'child_process',
    judgePath: 'path',
    mySqlCtl: servicePath + 'dataBaseControl/mysqlControl.js',
    redisCtl: servicePath + 'model/redisControl.js',
    URL: 'url',
    parseUrl: 'url',
    handleUrl: 'url',


}


letPathConfig = {
    getPixivData: ['StringTool', 'getHtmlData', 'imgFilter', 'cheerio', 'request'],
    getHtmlData: ['request', 'fs', 'events'],
    pixivDownloadControl: ['cp', 'judgePath', 'mySqlCtl'],
    proxyImg: ['StringTool', 'URL', 'request'],
    getPixivHotList: ['getPixivData', 'downloadImg', 'StringTool', 'redisCtl', 'parseUrl', 'querystring', 'downloadThread', 'handlePixivHotList'],
    downloadImg: ['request', 'fs', 'handleUrl', 'checkImg', 'events'],
}
//这样做不好，会污染运行的全局
//TODO 在不破坏封装性的情况下，对引入进行管理,参考依赖注入，nest
function requireMehod(configKey) {
    let config = letPathConfig[configKey];
    if (config) {
        for (let i = 0, len = config.length; i < len; i++) {
            let reqName = config[i];
            let address = pathAddress[reqName]
            if (typeof address !== 'string') {
                address = reqName;
            }
            global[reqName] = require(address);
        }

    } else {
        throw 'Config NOt Find';
    }
}
module.exports = requireMehod;
