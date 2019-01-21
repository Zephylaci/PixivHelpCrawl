
import { requireMehod } from "../../router/refPath";
const handlePixivHotList = requireMehod('pixivTagFilter');
const main={
    contrl:async (ctx,next)=>{
        ctx.body = {
            code: 200,
            content: '也许一切正常'
        }
        let upData = ctx.request.body;
        let tagsArr = upData.tags;
        if(Array.isArray(tagsArr)&&tagsArr.length>0){
            handlePixivHotList.addTags(tagsArr);
        }
    }
}

module.exports = main