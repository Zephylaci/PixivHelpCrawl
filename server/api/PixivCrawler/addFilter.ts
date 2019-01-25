
/**
 * TODO 设置返回值
 */
import  pixivTagFilter from '../../utils/pixivTagFilter';
const mainObj={
    contrl:async (ctx,next)=>{
        let upData = ctx.request.body;
        let tagsArr = upData.tags;
        if(Array.isArray(tagsArr)&&tagsArr.length>0){
            pixivTagFilter.addTags(tagsArr);
        }
    }
}

export default mainObj