import { getImgDetail } from "../../model/PixivImgStorageOperation";
import { queryBean, resultBean } from "../../type/bean/resultBean";

/*
* 本地数据操作相关
*/

export async function getImgTitleAndTagFromName(ctx) {
    let params = ctx.request.body;
    let { imgName } = params;
    ctx.body.code = '200'

    await getImgDetail({
        getImgOpt: {
            imgName
        },
        getValue: ['imgTitle', 'imgTags']
    }).then((queryRes:queryBean)=>{
        if(queryRes.retState===1){
            ctx.body.text = '查询完成'
            ctx.body.contents = queryRes.result;
        }
    })
}