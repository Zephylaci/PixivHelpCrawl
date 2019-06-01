import { cashConfig } from '../config/index';
const autoCash = cashConfig['autoCash'];

import { loggerShow, logger, loggerErr } from './utils/logger';
import { setRunEveryDay } from './utils/schedule';
import { concurrentHandleClass } from './service/class/concurrentHandle';
import { join } from 'path';

if (cashConfig.useCash === false || autoCash.enable === false) {

} else {
    //程序入口
    makePlan();
}

function startCash() {
    //开始缓存
    let plan = autoCash.plan;
    let deep = autoCash.deep;
    let linkList = makeLinkList(plan, deep);

    let cashProcessHandle = new concurrentHandleClass({
        queryName: 'autoCash',
        processPath: join(__dirname, '/service/process/cashChild')
    }, 2)

    cashProcessHandle.queryStart(linkList).overControl({
        success: (res) => {
            loggerShow.info('autoCash:缓存结束');
        },
        error: (err) => {
            loggerErr.error(err);
        }
    })

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
    function getYesterday() {
        var need = new Date(new Date().getTime() - 86400000);
        var year = need.getFullYear();
        var Month = addZero(need.getMonth() + 1)
        var day = addZero(need.getDate());
        function addZero(num) {
            var num = num.toString()
            if (num.length === 1) {
                num = '0' + num
            }
            return num
        }
        return year + '-' + Month + '-' + day

    }
}


function makePlan() {
    let runDate = autoCash.runDate;
    let runDateArr = runDate.split(':');
    let now = new Date().getTime();
    let toDayRunDate = new Date().setHours(Number(runDateArr[0]), Number(runDateArr[1]), Number(runDateArr[2]));
    if (toDayRunDate < now) {
        //第一次启动如果需要直接缓存延迟五秒
        logger.info('autoCash: 5s后开始缓存');
        setTimeout(startCash, 5000)
    }
    let jobs = setRunEveryDay({
        dateStr: runDate,
        task: startCash
    });
    logger.info('autoCash: 创建定时任务完成:', jobs.name)
}





