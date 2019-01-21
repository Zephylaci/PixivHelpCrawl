import { requireMehod } from "../router/refPath";

const getPixivData = requireMehod('getPixivData')
const pixivTagFilter = requireMehod('pixivTagFilter');

const redisCtl = requireMehod('redisCtl')
import {logger,loggerErr,loggerShow}  from '../utils/logger';
import { downloadProcessHandle, cashImgHandleSet } from "./downloadThread";
const MainUrlStr = 'https://www.pixiv.net/ranking.php?format=json&${type}&p=${page}&date=${date}';
export class handlePixivHotListClass {
    COMMON:any;
    closeRedis:any;
    constructor(
        {
            getType = null, //获取的类型（不能为null）
            getDate = null, //指定的时间(不能为null)
            startPage = 1,  //开始读取的页数
            endPage = 1,   //结束读取的页数
        }
    ) {
        //调用前注意参数的处理
        this.COMMON = {
            getType: getType,
            getDate: getDate,
            startPage: startPage,
            endPage: endPage
        }
        this.closeRedis = redisCtl.end;
    }
    //不使用缓存的主过程
    async queryStartNoCash() {

        let resultArr = [];
        let useCash = false;

        let COMMON = this.COMMON;
			
        let BaseUrl = MainUrlStr.replace('${type}', COMMON.getType).replace('${date}', COMMON.getDate.replace(/-/g, ''));
        for (let i = COMMON.startPage; i <= COMMON.endPage; i++) {
            var queryUrl = BaseUrl.replace('${page}', i);
            var queryResult = await this.originQuery(queryUrl, useCash);
            if(queryResult.retStat===1){
                resultArr = resultArr.concat(queryResult.data.contents);
            }
        }

        return resultArr;

    }
    async queryStartWithCash() {

        let resultArr = [];
        let useCash = true;
        let COMMON = this.COMMON;

        let mainKey = COMMON.getType.replace('mode=', '');
        let timeKey = COMMON.getDate.replace(/-/g, '') + '_p';

        let BaseUrl = MainUrlStr.replace('${type}', COMMON.getType).replace('${date}', COMMON.getDate.replace(/-/g, ''));
        for (let i = COMMON.startPage; i <= COMMON.endPage; i++) {
            let queryUrl = BaseUrl.replace('${page}', i);
            let _cashResult = null;
            //读取缓存
            await redisCtl.HMGET({
                mainKey: mainKey,
                key: timeKey + i
            }).then((res) => {
                if (Object.prototype.toString.call(res) === "[object Array]") {
                    let cashData = res[0];
                    //缓存的数据
                    if (cashData) {
                        _cashResult = JSON.parse(cashData).contents;
                    }

                }
            });
            if (_cashResult === null) {
                _cashResult = [];
                var queryResult = await this.originQuery(queryUrl, useCash);
                if(queryResult.retStat===1){
                    _cashResult = await this.saveQueryResult(queryResult);
                } 
            }
           resultArr = resultArr.concat(_cashResult);
        }
        //TODO 错误处理，及错误抛出
        //正常结束
        return resultArr;

    }
    async originQuery(url, useCash) {
        //过滤参数
        function changeData(item) {
            let cashItem = {};
            let needList = ['illust_id', 'title', 'originUrl', 'url', 'illust_page_count', 'rank', 'tags'];
            needList.map((key)=>{
                cashItem[key] = item[key]
            });
            return cashItem
        }
        //制作下载列表,同步多线程下载
        function makeDownList(item, info) {
            if (info.cashDownList) {
                info.cashDownList.push(item['originUrl'])
            }
            else {
                info.cashDownList = []
                info.cashDownList.push(item['originUrl'])
            }
            return item
        }

        let handleList:Array<any> = [changeData];
        if (useCash) {
            handleList.push(makeDownList);
        }
        let getResult = await new getPixivData.ConvenientClass().contrl(url,handleList,pixivTagFilter.judgeItem);
        let result = null;
        if(!getResult){
            loggerErr.error(`pixivHotList: 读取数据失败 ${url}`)
            result = {
                retStat: 0
            }
            return result
        }
        result ={
            retStat:1,
            key:getResult.date + '_p' + getResult.page,
            mainHash:getResult.mode,
            data:{
                contents:getResult.contents
            }
        };

        if(Array.isArray(getResult.cashDownList)){
            result.cashDownList=getResult.cashDownList
        }



        return result
    }
    async saveQueryResult(queryResult) {
        //缓存逻辑
        console.time('downImgList');
        
        var downList = queryResult.cashDownList

        
       
        let resHandle =  cashImgHandleSet(queryResult.data.contents);
        await downloadProcessHandle.downList(downList).then(resHandle);

        delete queryResult.cashDownList;
		let  setRedis = JSON.stringify(queryResult);
        await redisCtl.HMSET(JSON.parse(setRedis));
        console.timeEnd('downImgList');
        return queryResult.data.contents;
    }
}


