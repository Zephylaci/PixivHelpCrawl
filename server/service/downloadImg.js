/**
*  下载模块 v 0.2
*  功能：根据url下载文件到指定文件夹 
*        
**/
const servicePath = '../';
const manPath = '../../';

const pixivAbout = require(manPath + 'config')['pixivConfig'];
const pathConfig = require(manPath + 'config')['pathConfig'];

const requireMehod = require(servicePath + 'router/refPath.js');
const request = requireMehod('request');
const fs = requireMehod('fs');
const parseUrl = requireMehod('url');
const checkImg = requireMehod('checkImg');

const pathCash = {}
pathCash[pathConfig.downloadPath] = true;

function downLoadMethod(url, upPath = pathConfig.downloadPath) {
    const newDownObj = new downLoadClass({
        downFrom: 'pixiv',
        downToPath: upPath,
        wait: 5000,
        tryNum: 3
    })
    let promise = newDownObj.start(url);
    return promise;
}


class downLoadClass {
    constructor({
        downFrom = 'pixiv',
        downToPath = pathConfig.downloadPath,
        wait = 5000,
        tryNum = 3
    }) {
        this.downToPath = downToPath;
        this.downFrom = 'pixiv'; //TODO 支持其它图站的下载
        this.tryAgainConfig = {
            wait: wait,
            tryNum: tryNum,
        }
    }
    start(url) {
        let downObj = this;
        let urlObj = parseUrl.parse(url);
        let fileName = urlObj.path.slice(urlObj.path.lastIndexOf('/'));
        let imgPath = downObj.downToPath + fileName;
        if (!pathCash[downObj.downToPath] && !fs.existsSync(downObj.downToPath)) {
            fs.mkdirSync(downObj.downToPath)
            pathCash[downObj.downToPath] = true;
        }

        let promise = new Promise((resolve, reject) => {

            let Option = {
                mainDownloadEnd: resolve,
                headers: pixivAbout.headers,
                url: url,
                fileName: fileName,
                imgPath: imgPath,
                runNum: 1,
            }
            if (checkImg(imgPath)) {
                console.log('downLoadImg:文件 ' + fileName + ' 存在且已经下载完全.');
                downObj.downOver(Option);
            } else {
                downObj.downMethod(Option);
            }


        });
        return promise;
    }
    downMethod(Option) {
        let downObj = this;
        if (Option.waitTimer != null) {
            global.clearTimeout(Option.waitTimer);
            Option.waitTimer = null;
        }

        let fileName = Option.fileName;
        let imgPath = Option.imgPath;
        let requresOpt = {
            url: Option.url,
            headers: Option.headers
        }
        let stream = fs.createWriteStream(Option.imgPath);
        let downRequest = request(requresOpt);
        downRequest.catch(() => {
            console.log('downLoadImg:文件 ' + fileName + '下载失败，发生错误');
            downObj.tryAgain(Option);
        });
        let pipe = downRequest.pipe(stream);
        pipe.on('error', e => {
            console.log('downLoadImg:文件 ' + fileName + '下载失败，发生错误：', e);
            downObj.tryAgain(Option);
        });
        pipe.on('finish', () => {
            if (checkImg(imgPath)) {
                console.log('downLoadImg:文件 ' + fileName + '下载完成！下载次数：' + Option.runNum);
                Option.downState = 'downOver'
                downObj.downOver(Option);
            } else {
                console.log('downLoadImg:文件 ' + fileName + '下载出错,文件不完全');
                if (Option.runNum === 1) {
                    downObj.tryAgain(Option);
                } else {
                    console.log('downLoadImg:文件 ' + fileName + '下载完成,但是可能文件不完全!下载次数:' + Option.runNum);
                    Option.downState = 'incomplete'
                    Option.mainDownloadEnd(Option);
                }

            }

        });
    }
    downOver(Option) {
        Option.state = 'sucess'
        Option.mainDownloadEnd(Option);
    }
    tryAgain(Option) {
        let downObj = this;
        let tryConfig = downObj.tryAgainConfig;
        Option.wait = tryConfig.wait;
        Option.waitTimer = null;
        console.log('downLoadImg：进入重试流程，等待时间，', Option.wait / 1000, 's');

        if (Option.runNum <= tryConfig.tryNum) {
            if (Option.waitTimer === null) {
                Option.waitTimer = global.setTimeout(() => {
                    Option.runNum++;
                    console.log('downLoadImg:文件 ' + Option.fileName + '尝试第：' + Option.runNum + '次重下');
                    Option.wait = Option.wait + Option.wait;
                    downObj.downMethod(Option);
                }, Option.wait);
            } else {
                console.log('downLoadImg:文件 ' + Option.fileName + '已经创建等待任务');
            }
        } else {
            console.log('downLoadImg:文件下载失败，已尝试：' + Option.runNum + '次重下');
            Option.downState = 'faill'
            Option.mainDownloadEnd(Option);
        }

    }
}
module.exports = downLoadMethod;