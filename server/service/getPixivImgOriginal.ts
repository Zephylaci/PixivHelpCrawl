import { getProcessItem } from "../utils/processHandle";
import { loggerShow, logger, loggerErr } from "../utils/logger";


let Process = getProcessItem({
    processAddr:'../process/getPixivImgProcess',
    processName:'getPixivImgProcess'
});
let COMMON={
    runStat:false,
    addItem:0,
    step:0,
    resList:[]
}

export function downList(queryList){
    if(queryList.length>0){
        loggerShow.info(`getPixivImgOriginal : 输入：${queryList.length}`);
        COMMON.addItem+=queryList.length;
        COMMON.step++;
        Process.send(queryList).then((res:Array<any>)=>{
            COMMON.resList = COMMON.resList.concat(res);
            COMMON.step--;
            if(COMMON.step===0){
                checkOver();
            }
        });
    }
    if (COMMON.runStat === false) {
        if (queryList.length != 0) {
            COMMON.runStat = true;
            return '本次云端下载已开始'
        } else {
            return'云端已就绪'
        }
    } else {
        if (queryList.length != 0) {
            return'云端下载中，且已将本次提交添加至队列';
        } else {
            return'云端下载中'
        }
    }

}
function checkOver(){
    let result = COMMON.resList;
    if(result.length!==COMMON.addItem){
        loggerErr.error('getPixivOriginal:未被预料到的结束！');
        loggerErr.error(JSON.stringify(COMMON));
    }else{
        let errIdArr = [];
        loggerShow.info(`getPixivImgOriginal : 总输出：${result.length}`);
        result.forEach(element => {
            if(element.state.indexOf('Err')!==-1){
                loggerShow.warn(`downErr:${JSON.stringify(element)}`);
                errIdArr.push(element.imgId);
            }
        });
        if(errIdArr.length===0){
            loggerShow.info(`getPixivImgOriginal : 任务完成`);
        }else{
            logger.warn('失败：',errIdArr.length);
            logger.warn('pixivDownloadControl 存在下载出错的图片！10S后重试!');
            setTimeout(()=>{
                downList(errIdArr); 
            },10000)
        }
    }
    COMMON.runStat = false;
    COMMON.addItem = 0;
    COMMON.step=0;
    COMMON.resList=[];
}