
import * as cp from 'child_process';
import { concurrentHandleClass } from './publicClass/concurrentHandle';
import { join } from 'path';
let {logger,loggerErr,loggerShow} = require('../utils/logger')


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
            processPath:join(__dirname,'/process/downloadChild')
        },5);
        return downloadProcessHandle.queryStart(list).overControl();
        
    }
}

