import pixivSearch from '../../service/pixivSearch';

const mainObj = {
    makePlan:(ctx,next)=>{

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

        ctx.body.contents = pixivSearch.getList();
    },
    getState:(ctx,next)=>{

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
export default mainObj
