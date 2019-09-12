import { filterTag } from "../../utils/pixivTagFilter";

/**
 * TODO:设置返回值
 */
const filterHandle = new filterTag()

const mainObj = {
    contrl: async (ctx, next) => {
        let upData = ctx.request.body;
        let tagsArr: [string] = upData.tags;
        if (Array.isArray(tagsArr) && tagsArr.length > 0) {
            tagsArr.forEach((tagName: string) => {
                filterHandle.addFilterTagName(tagName)
            });
        }
    }
}

export default mainObj