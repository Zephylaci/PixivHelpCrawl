const servicePath = '../';
const manPath = '../../';
const requireMehod = require(servicePath + 'router/refPath.js');
const getPixivData = requireMehod('getPixivData');
const publicClass = require('./publicClass/concurrentHandle.js');
const StringTool = requireMehod('StringTool');

class searchProcess {
    constructor({
        strKey="",
        baseUrl = 'https://www.pixiv.net/search.php?s_mode=s_tag&mode=MODE &word=STRKEY&p=${page};',
        startPage=1,
        endPage=2,
        bookmarkCountLimit=100,
    }){
        this.common={
            strKey,
            baseUrl,
            startPage,
            endPage,
            bookmarkCountLimit,
            state:'before',  // brefore running over
        }
        this.contrlMethod={
            queryOver:null
        };
        
        this.promise = null;
        this.result = {
            items:[],
            relatedTags:null
        };
        this.queryProcess = null
    }
    control(){
        let process = this;
        let common = process.common;
        let stateTable = {
            'before':()=>{
                process.start();
                common.state = 'running';
                
                return process.promise
            },
            'running':()=>{
                return process.promise
            },
            'over':()=>{
                return {
                    processState:common.state,
                    result:process.result
                }
            },
        }
        return stateTable[common.state]();
        
    }
    
    start(){
        const pixivSearchClass = new publicClass(3);
        let process = this;
        let common = process.common;
        
        let queryList = [];
        for(let i = common.startPage,l=common.endPage;i<=l;i++){
            let queryUrl = common.baseUrl.replace('${page}',i);
            queryList.push(queryUrl);
        }
        
        pixivSearchClass.queryInit({
            queryName: 'pixivSearch',
            step: process.oneSetp.bind(process), //单次操作 通常是async函数，返回需要的结果值 
        });
        
        pixivSearchClass.queryStart(queryList);   
        process.queryProcess = pixivSearchClass;
        process.promise = pixivSearchClass.overControl();
        process.promise.then(process.queryOver.bind(process));
        
    }
    breakQuery(){
        let process = this;
        console.log('pixivSearch 读取到无信息页，队列清零')
        process.queryProcess.common.linkList = [];
    }
    async oneSetp(queryItem){
        let queryUrl = queryItem;
        let queryProcess = new getPixivData.InsightClass();
        let queryResult = await queryProcess.contrl(queryUrl);
        
        let process = this;
        if(!process.result.relatedTags){
            process.result.relatedTags = queryResult.relatedTags;
        }   
        let resultItems = process.result.items;
        let bookmarkCountLimit = process.common.bookmarkCountLimit;
          
        let getItemsArr = queryResult.items;
        if(queryResult.items.length===0){
            process.breakQuery();
        }
        
        getItemsArr.forEach((item)=>{
            let {
                illustId,
                illustTitle,
                url,
                tags,
                bookmarkCount,
            } = item;
            
            if(bookmarkCount>=bookmarkCountLimit){
                //适配参数，与获取热榜的一致
                let item = {
                    illust_id:illustId,
                    title:illustTitle,
                    url,
                    tags,
                    bookmarkCount
                }
                let proxyUrl = '/api/proxyImg?url=' + StringTool.strToHexCharCode(url);
                
                item.originUrl = url;
                item.url = proxyUrl; 
                resultItems.push(item)
            }
        });
        
        return queryResult.items.length;
    }
    
    queryOver(resArr){
        let process = this;
        let common = process.common;
        
        let resultItems = process.result.items;
        resultItems = resultItems.sort((first,Second)=>{
            return Second.bookmarkCount - first.bookmarkCount 
        });

        common.state = 'over';
        delete process.queryProcess;
        
        console.log(process.common.baseUrl,'over');
                    
    }
    
}
const planStore={};

function makePlan({
            strKey="",
            isSafe=false,
            startPage=1,
            endPage=2,
            bookmarkCountLimit=100,
        }){
        let mode = '';
        if(isSafe){
            mode = '&mode=safe'
        }
        let baseUrl = 'https://www.pixiv.net/search.php?s_mode=s_tag'+mode+'&word='+ encodeURI(strKey)+'&p=${page}';
        //let planKey = now.getHours()+'-'+now.getMinutes()+'-'+now.getSeconds()+`_${startPage}-${endPage}`;
        let planKey = new Date().toLocaleTimeString()+`_${startPage}-${endPage}`;
        let searchPlan = new searchProcess({
            strKey,
            baseUrl,
            startPage,
            endPage,
            bookmarkCountLimit,
        });

        searchPlan.control();
        
        planStore[planKey] = searchPlan;
        return {
            planKey
        }

}
function getStateByKey(planKey){
    let searchPlan = planStore[planKey];
    if(!searchPlan){
        return null
    }
    let {state,strKey} = searchPlan.common;
    let count = searchPlan.result.items.length;
    return {
        strKey,
        state,
        count
    }
}
function getDetail(planKey){
    let searchPlan = planStore[planKey];
    if(!searchPlan){
        return null
    }
    return searchPlan.result.items
}
function getList(){
    let planKeyArr = [];
    for(let key in planStore){
        planKeyArr.push(key);
    }
    return planKeyArr;
}
module.exports = {
    makePlan,
    getStateByKey,
    getDetail,
    getList
}