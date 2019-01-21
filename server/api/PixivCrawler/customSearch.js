const servicePath = '../../';
const manPath = '../../../';
import { requireMehod } from "../../router/refPath";
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
            cashPreview=false,
            startPage=1,
            endPage=2,
            bookmarkCountLimit=100,
        } = ctx.request.body;

        if(typeof isSafe==='string'){
            isSafe=isSafe==='false'?false:true;
            cashPreview=cashPreview==='false'?false:true;
        }
        if(startPage>endPage){
            endPage = startPage
        }
        let state = pixivSearch.makePlan({
           strKey,
           isSafe,
           cashPreview,
           startPage,
           endPage,
           bookmarkCountLimit
        });
        ctx.body.contents =state 
        
    },
    getList:(ctx,next)=>{
        ctx.body = {
            code: 200,
            contents: '为啥没有返回值..'
        }
        ctx.body.contents = pixivSearch.getList();
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
    },
    delItem:(ctx,next)=>{
        ctx.body = {
            code: 200,
            contents: '为啥没有返回值..'
        }
        let {
            planKey="",
        } = ctx.request.body; 

        let state = pixivSearch.delItem(planKey);
        if(state){
            ctx.body.contents =state 
        }else{
            ctx.body.code=201
        }
    },
    createPreviewCash:(ctx,next)=>{
        ctx.body = {
            code: 200,
            contents: '为啥没有返回值..'
        }
        let {
            planKey="",
        } = ctx.request.body; 

        let state = pixivSearch.createPreviewCash(planKey);
        if(state){
            ctx.body.contents =state 
        }else{
            ctx.body.code=201
        }
    },
}
module.exports=main;
