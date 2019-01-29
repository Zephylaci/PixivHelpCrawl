import { concurrentHandleClass } from './class/concurrentHandle';
import {downloadImg} from './downloadImg';
let {logger,loggerErr,loggerShow} = require('../utils/logger')
const downloadPath = './client/cash';

export function cashImgHandleSet(cashImgContents){
    let handleFun = (downRes)=>{
        var fileNameMap = {};
        var getIdReg = /\/([0-9]{8,})_/;
        downRes.map((item, index) => {
            var id = getIdReg.exec(item.fileName)[1];
            fileNameMap[id] = item.fileName
        });
        cashImgContents = cashImgContents.map((item, index) => {
            var id = item.illust_id;
            if (fileNameMap[id]) {
                item['originUrl'] = item['url'];
                item['url'] = '/cash' + fileNameMap[id];
            }
            return item
        });
    }
    return handleFun
}

export let downloadProcessHandle = {
    downList:(list)=>{
        let downloadProcessHandle = new concurrentHandleClass({
            queryName:'downloadThread',
            step:downloadStep
        },5);
        return downloadProcessHandle.queryStart(list).overControl();
        
    }
}








function downloadStep(url) {
    var tryGet = 1;
    var wait = 5000;
    var overTask:Function = null;
    var result:{
        fileName?:string;
        imgPath?:string;
        downState?:string;
    } = {};
    let promise = new Promise ((resolve,reject)=>{
        overTask = resolve;
    })
    downStep(url)
    function downStep(downUrl){
        downloadImg(downUrl, downloadPath).then((dres: any) => {
            tryGet = 1;
            result.fileName = dres.fileName;
            result.imgPath = dres.imgPath;
            overTask(result);
        }).catch((err) => {
            loggerErr.error('cashChild: error', err);
            loggerShow.info('cashChild：进入重试流程，等待时间，', wait / 1000, 's');
            if (tryGet < 5) {
                setTimeout(() => {
                    downStep(downUrl)
                }, wait)
                tryGet++
                wait += wait;
            } else {
                tryGet = 1;
                result.downState = 'faill';
                overTask(result);
            }
        });
    }
    
    return promise
}

