/*
* 模块地址在此管理
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
    
    mySqlCtl: servicePath + 'dataBaseControl/mysqlControl.js',
    redisCtl: servicePath + 'model/redisControl.js',

    parsePath: 'path',
    parseUrl: 'url',

}

/*
letPathConfig = {
    //getPixivData: ['StringTool', 'getHtmlData', 'imgFilter', 'cheerio', 'request'],
    //getHtmlData: ['request', 'fs', 'events'],
    //pixivDownloadControl: ['cp', 'parsePath', 'mySqlCtl'],
    //proxyImg: ['StringTool', 'parseUrl', 'request'],
   // getPixivHotList: ['getPixivData', 'downloadImg', 'StringTool', 'redisCtl', 'parseUrl', 'querystring', 'downloadThread', 'handlePixivHotList'],
    //downloadImg: ['request', 'fs', 'handleUrl', 'checkImg', 'events','parseUrl'],
}
*/
function requireMehod(modulName) {
    let addr = pathAddress[modulName];
    if (addr) {
        return require(addr);
    } else {
         return require(modulName);
    }
}
module.exports = requireMehod;
