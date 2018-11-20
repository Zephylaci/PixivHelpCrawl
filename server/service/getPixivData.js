const servicePath = '../';
const manPath = '../../';

const requireMehod = require(servicePath + 'router/refPath.js');
const StringTool = requireMehod('StringTool');
const getHtmlData = requireMehod('getHtmlData');
const cheerio = requireMehod('cheerio');

var Trial = Norn();
const mainObj = {
    //通用的返回
    contrl: async (queryUrl) => {
        let opt = {
            url: queryUrl
        }
        let result = {};

        let getHtmlPromise = getHtmlData.start(opt);
        getHtmlPromise.then((getResult) => {
            if (getResult.code === 200) {
                let handleOpt = {
                    upUrl: queryUrl,
                    info: getResult.data,
                }

                result = Trial(handleOpt);
            } else {
                result = getResult.data
            }
        })
        getHtmlPromise.catch((err) => {
            result = err;
        })
        await getHtmlPromise

        return result;

    }
}

//所有定制 请求方法的共用部分
class NornClass{
	queryContrl(opt={
        url:''
    }){

        let result = {};
        let promise = new Promise((resolve, reject) => {
            let getHtmlPromise = new getHtmlData.getPixivHtmlClass().start(opt);
            getHtmlPromise.then((getResult) => {
               
                resolve(getResult);
            });
            getHtmlPromise.catch((err) => {
                result = err;
                let fakeResult = {
                    code:500,
                    data:null
                }
                resolve(fakeResult,opt)
            })

        });

        return promise;
	}
	
}

//单次页面解析的模板 getPixivImgOriginal 用
mainObj.MonomersClass = class extends NornClass{
    constructor() {
    }
    async contrl(queryUrl) {
        let opt = {
            url: queryUrl
        }
        let result = null;
        await this.queryContrl(opt).then((getResult)=>{
            if (getResult.code === 200) {
                let handleOpt = {
                    upUrl: queryUrl,
                    info: getResult.data,
                }
                result = Trial(handleOpt);
            }
            else {
                result = getResult.data
            }
            if(result){
                console.log('MonomersClass queryOver', opt.url,'=>',result.urls.original);
            }
            else{
                console.log('MonomersClass queryOver err');
            }
        });
        return result;
    }
}

//获取列表页用 handlePixivHotList 用
mainObj.ConvenientClass = class extends NornClass{
    constructor() {
    }
    async contrl(queryUrl) {
        let opt = {
            url: queryUrl
        }
        let result = null;
        await this.queryContrl(opt).then((getResult,callbackArrConfig=[])=>{
            if (getResult.code === 200) {
                let handleOpt = {
                    upUrl: queryUrl,
                    info: getResult.data,
                }
                Object.assign(Norn.Scales.Public,handleOpt);
                //需要过滤可以从这里传进去
                result = Norn.Scales.Convenient(callbackArrConfig);
            }else {
                result = getResult.data
            }
            
            if(result){
                console.log('MonomersClass queryOver', opt.url,'=>',result.urls.original);
            }
            else{
                console.log('MonomersClass queryOver err');
            }
        });
        return result;
    }
}

/**
* upUrl 读取到的url 不同的url进不同的处理过程
* info getHtmlData返回的数据，可能是json也可能是Html
* 
**/
function Norn() {
    var Alignment = ['Convenient', 'Monomers', 'Insight', 'Ordinary'] //执行优先顺序
    return function (handleOpt) {
        var Public = Norn.Scales.Public;
        var result = ""

        Public.upUrl = handleOpt.upUrl;
        Public.info = handleOpt.info;

        var Method = Norn.Scales;
        var i = 0;
        runMethod(i);
        function runMethod(i) {
            result = Method[Alignment[i]]();
            if ((result === 'next')) {
                i++;
                runMethod(i);
            }
        }
        return result;
    }
}
/*
* 几种处理模式
* Public:公共变量 common
* Ordinary:平凡的 针对首页的处理模式，很多页面也能用
* Insight:洞察 针对搜索返回页
* Monomers:单体 针对单id返回页
* Convenient:不需要 不需要处理，针对json返回
*/
Norn.Scales = {
    Public: {
        upUrl: '',
        $: '',
        info: ''
    },
    Convenient: (callbackArrConfig=[]) => {
         
        var Public = Norn.Scales.Public;
        var upUrl = Public.upUrl;
        var info = Public.info;
        if (upUrl.indexOf('format=json') != -1) {
            if (typeof info === "string") {
                //兼容
                info = JSON.parse(Public.info)
            }
            let callbackArr = [
                (item)=>{
                    //2018/7/28 p站缩略图403对策
                    let url = item.url;
                    let proxyUrl = '/api/proxyImg?url=' + StringTool.strToHexCharCode(url);
                    item.originUrl = url;
                    item.url = proxyUrl;
                    return item;
                }
            ]
            callbackArr = callbackArr.concat(callbackArrConfig);
            var resArr = info.contents;
            info.contents = resArr.map(item){
                callbackArr.forEach((step)=>{
                   item=step(item,info);
                })
                return item;
            }

            return info
        } else {
            var info = Public.info;
            Public.$ = cheerio.load(info, {
                decodeEntities: false
            });
            return 'next';
        }
    },
    Monomers: () => {
        var Public = Norn.Scales.Public;
        var upUrl = Public.upUrl;
        var $ = Public.$;
        if (upUrl.indexOf('illust_id') != -1) {
            var result = $('head').html();
            var cashInfo = null
            if (result) {
                var authorReg = new RegExp('.*,"name":"|","image":.*');
                var objReg = new RegExp('.*,preload:|,user.*');
                var strobj = 'var illustInfo = ' + result.split(objReg)[1] + '}';
  
                try{
                    eval(strobj);
                }
                catch(e){
                    console.log(e);
                   return null; 
                }
               
                //illustInfo.authorName = result.split(authorReg)[1];

                cashInfo = illustInfo.illust;
                for (let key in cashInfo) {
                    cashInfo = cashInfo[key];
                }

            }

            return cashInfo;

        } else {

            return 'next';
        }
    },
    Insight: () => {
        var Public = Norn.Scales.Public;
        var upUrl = Public.upUrl;
        var $ = Public.$

        if (upUrl.indexOf('search.php') != -1) {
            return $('#js-mount-point-search-result-list').data();
        } else {
            return 'next';
        }
    },
    Ordinary: () => {
        var Public = Norn.Scales.Public;
        var $ = Public.$;
        var css = $('link');
        var result = $('#wrapper');
        result.find('script').remove();
        result.append(css);
        return result.html();
    }
}



module.exports = mainObj;