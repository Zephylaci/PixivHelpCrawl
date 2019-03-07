
import getPixivData from '../service/getPixivData';
import  pixivTagFilter from '../utils/pixivTagFilter';

import {loggerErr}  from '../utils/logger';
import { downloadProcessHandle, cashImgHandleSet } from "./downloadThread";

const MainUrlStr = 'https://www.pixiv.net/ranking.php?format=json&${type}&p=${page}&date=${date}';
/**
 *  日榜api数据的获取
 *  FIXME: 使用缓存的实现
 */
export class handlePixivHotListClass {
    private COMMON:{
        getType: string,
        getDate: string,
        startPage: number,
        endPage: number
    };
    constructor(
        {
            getType , //获取的类型（不能为null）
            getDate , //指定的时间(不能为null)
            startPage=1,  //开始读取的页数
            endPage=1,   //结束读取的页数
        }
    ) {
        //调用前注意参数的处理
        this.COMMON = {
            getType: getType,
            getDate: getDate,
            startPage: startPage,
            endPage: endPage
        }
    }
    //不使用缓存的主过程
    async queryStartNoCash() {

        let resultArr = [];
        let useCash = false;

        let COMMON = this.COMMON;
			
        let BaseUrl = MainUrlStr.replace('${type}', COMMON.getType).replace('${date}', COMMON.getDate.replace(/-/g, ''));
        for (let i = COMMON.startPage; i <= COMMON.endPage; i++) {
            var queryUrl = BaseUrl.replace('${page}', String(i));
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
            let queryUrl = BaseUrl.replace('${page}', String(i));
            let _cashResult = null;
            //读取缓存
            //TODO: 将缓存数据读取至 _cashResult,错误处理，及错误抛出
            
            if (_cashResult === null) {
                _cashResult = [];
                var queryResult = await this.originQuery(queryUrl, useCash);
                if(queryResult.retStat===1){
                    _cashResult = await this.saveQueryResult(queryResult);
                } 
            }
           resultArr = resultArr.concat(_cashResult);
        }
    
        //正常结束
        return resultArr;

    }
    private async originQuery(url, useCash) {
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
    private async saveQueryResult(queryResult) {
        //TODO: 缓存逻辑
  
        var downList = queryResult.cashDownList
        let resHandle =  cashImgHandleSet(queryResult.data.contents);
        await downloadProcessHandle.downList(downList).then(resHandle);

        delete queryResult.cashDownList;
		let  setRedis = JSON.stringify(queryResult);
 
        return queryResult.data.contents;
    }
}


