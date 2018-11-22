const servicePath = '../../';
const manPath = '../../../';
const requireMehod = require(servicePath + 'router/refPath.js');
const pixivSearch = requireMehod('pixivSearch');



const main = {
    makePlan:(ctx,next)=>{
        ctx.body = {
            code: 200,
            contents: '为啥没有返回值..'
        }
        let {
            strKey="",
            isSafe=false,
            startPage=1,
            endPage=2,
            bookmarkCountLimit=100,
        } = ctx.request.body;
        strKey = encodeURI(strKey);
        if(startPage>endPage){
            endPage = startPage
        }
        let state = pixivSearch.makePlan({
           strKey,
           isSafe,
           startPage,
           endPage,
           bookmarkCountLimit
        });
        ctx.body.contents =state 
        
    },
    getList:(ctx,next)=>{
    },
    getState:(ctx,next)=>{
        ctx.body = {
            code: 200,
            contents: '为啥没有返回值..'
        }
        let {
            planKey="",
        } = ctx.request.body;

        let state = pixivSearch.getStateByKey(planKey);
        if(state){
            ctx.body.contents =state 
        }else{
            ctx.body.code=201
        }
        
    },
    getDetail:(ctx,next)=>{
        ctx.body = {
            code: 200,
            contents: '为啥没有返回值..'
        }
        let {
            planKey="",
        } = ctx.request.body;

        let state = pixivSearch.getDetail(planKey);
        if(state){
            ctx.body.contents =state 
        }else{
            ctx.body.code=201
        }
    }
}
module.exports=main;
