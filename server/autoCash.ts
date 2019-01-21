import {redisConfig} from '../config/index';
const autoCash = redisConfig['autoCash'];

import {loggerShow,logger, loggerErr} from './utils/logger';
import {setRunEveryDay} from './utils/schedule';
import * as cp from 'child_process';
import { concurrentHandleClass } from './service/publicClass/concurrentHandle';
import { join } from 'path';

if (redisConfig.useCash === false || autoCash.enable === false) {
    
}else{
    //程序入口
    makePlan();
}



function startCash() {
    //开始缓存
    let plan = autoCash.plan;
    let deep = autoCash.deep;
    let linkList = makeLinkList(plan, deep);
    
    let cashProcessHandle = new concurrentHandleClass({
        queryName:'autoCash',
        processPath:join(__dirname,'/service/process/cashChild')
    },2)
    cashProcessHandle.queryStart(linkList).overControl().then((res)=>{
        logger.info(`autoCash: 缓存结束`);
    }).catch((err)=>{
        loggerErr.error(err);
    });
 
    logger.info(`autoCash: 缓存开始`);
    function makeLinkList(plan, deep) {
        var linkList = [];

        for (var i = 0; i < plan.length; i++) {
            linkList.push({
                getType: plan[i],
                getDate: getYesterday(),
                startPage: 1,
                endPage: deep
            })
        }

        return linkList
    }
   function getYesterday(){
		var need = new Date(new Date().getTime()-86400000);
		var year = need.getFullYear();
		var Month = addZero(need.getMonth()+1)
		var day= addZero(need.getDate());
		function addZero(num){
			var num = num.toString()
			if(num.length===1){
				num = '0'+num
			}
			return num
		}
		return year+'-'+Month+'-'+day

	}
}


function makePlan() {
    let runDate = autoCash.runDate;
    let runDateArr = runDate.split(':');
    let now = new Date().getTime();
    let toDayRunDate = new Date().setHours(Number(runDateArr[0]), Number(runDateArr[1]), Number(runDateArr[2]));
    if(toDayRunDate<now){
        startCash();
    }
    let jobs = setRunEveryDay({
        dateStr:runDate,
        task:startCash
    });
    logger.info('autoCash: 创建定时任务完成:',jobs.name)
}





