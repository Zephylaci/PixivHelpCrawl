/*
* 模块地址在此管理
 */

const servicePath = '../';

let pathAddress = {
    StringTool: servicePath + 'utils/stringTool',
    checkImg: servicePath + 'utils/checkImg',
    request: servicePath + 'utils/customRequest',
    imgFilter: servicePath + 'utils/imgFilter',
    pixivTagFilter:servicePath + 'utils/pixivTagFilter',
    
    downloadImg: servicePath + 'service/downloadImg',
    downloadThread: servicePath + 'service/downloadThread',
    pixivDownloadControl: servicePath + 'service/pixivDownloadControl',
    getHtmlData: servicePath + 'service/getHtmlData',
    getPixivData: servicePath + 'service/getPixivData',
    handlePixivHotList: servicePath + 'service/handlePixivHotList',
    pixivSearch: servicePath + 'service/pixivSearch',
   

    cp: 'child_process',
    
    mySqlCtl: servicePath + 'model/mysqlControl',
    redisCtl: servicePath + 'model/redisControl',

    pixivDownloadModel:servicePath + 'model/pixivDownloadModel',

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
export function requireMehod(modulName) {
    let addr = pathAddress[modulName];
    if (addr) {
        return require(addr);
    } else {
         return require(modulName);
    }
}
