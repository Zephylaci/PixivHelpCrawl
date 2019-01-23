import { getProcess } from "../utils/processHandle";
import { loggerShow } from "../utils/logger";


let Process = getProcess({
    processAddr:'../service/process/getPixivImgProcess',
    processName:'getPixivImgProcess',
    waitTime:3000
});

export let getPixivImgOriginal = {
    /**
     *  实际的调用入口 
    */
    downList: function (queryList) {
        loggerShow.info(`getPixivImgOriginal : 输入：${queryList.length}`);
        return Process.send(queryList);
    },
    addList:function(queryList){
        loggerShow.info(`getPixivImgOriginal : 追加输入：${queryList.length}`);
        Process.send(queryList).then((res)=>{
            loggerShow.info(`getPixivImgOriginal : 追加输出：${queryList.length}`);
        });
    } 
}
