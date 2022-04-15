
import getPixivData from '../service/getPixivData';

import {loggerErr}  from '../utils/logger';
import { downloadProcessHandle, cashImgHandleSet } from "./downloadThread";
import { getListCash, insertListCash } from '../model/PixivListStorageOperation';

const MainUrlStr = 'https://www.pixiv.net/ranking.php?format=json&${type}&p=${page}&date=${date}';
/**
 *  日榜api数据的获取
 */
//TODO: 替换成使用api的实现
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
                resultArr = resultArr.concat(queryResult.contents);
            }
        }

        return resultArr;

    }
    async queryStartWithCash() {

        let resultArr = [];
        let useCash = true;
        let COMMON = this.COMMON;

        let typeKey = COMMON.getType.replace('mode=', '');
        let timeKey = COMMON.getDate;

        let BaseUrl = MainUrlStr.replace('${type}', COMMON.getType).replace('${date}', COMMON.getDate.replace(/-/g, ''));
        for (let i = COMMON.startPage; i <= COMMON.endPage; i++) {
            let _cashResult = null;
            let getListOpt = {
                listFromDate:timeKey,
                listType:typeKey,
                listPage:i
            }
            //读取缓存
            await getListCash(getListOpt)
                .then(queryBean=>{
                    if(queryBean.retState===1&&queryBean.result!==false){
                        let queryRes = queryBean.result;
                        _cashResult = JSON.parse(queryRes.result)['contents'];
                    }
                })
                .catch(err=>{
                    loggerErr.error(err);
                })
            if (_cashResult === null) {
                let queryUrl = BaseUrl.replace('${page}', String(i));
                _cashResult = [];
                var queryResult = await this.originQuery(queryUrl, useCash);
                if(queryResult.retStat===1){
                    _cashResult = await this.saveQueryResult(queryResult,getListOpt);
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
        //制作下载列表,方便同步多线程下载
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
        //TODO: 对参数结果的处理可以换个地方写
        let handleList:Array<any> = [changeData];
        if (useCash) {
            handleList.push(makeDownList);
        }
        //TODO: 获得列表的方式替换
        let getResult = await new getPixivData.ConvenientClass().contrl(url,handleList);
        let result = null;
        if(!getResult){
            loggerErr.error(`pixivHotList: 读取数据失败 ${url}`)
            result = {
                retStat: 0
            }
            return result
        }
        result ={
            retStat: 1,
            contents:getResult.contents
        };

        if(Array.isArray(getResult.cashDownList)){
            result.cashDownList=getResult.cashDownList
        }

        return result
    }
    private async saveQueryResult(queryResult,insertOpt) {
      
        var downList = queryResult.cashDownList
        let resHandle =  cashImgHandleSet(queryResult.contents);
        await downloadProcessHandle.downList(downList).then(resHandle);
        
        delete queryResult.cashDownList;
        delete queryResult.retStat;

        let  result = JSON.stringify(queryResult);
        insertOpt.result = result;

        await insertListCash(insertOpt);
 
        return queryResult.contents;
    }
}


