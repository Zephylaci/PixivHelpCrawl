

import  pixivTagFilter from '../../utils/pixivTagFilter';
const mainObj={
    contrl:async (ctx,next)=>{
        ctx.body = {
            code: 200,
            content: '也许一切正常'
        }
        let upData = ctx.request.body;
        let tagsArr = upData.tags;
        if(Array.isArray(tagsArr)&&tagsArr.length>0){
            pixivTagFilter.addTags(tagsArr);
        }
    }
}

export default mainObj