import { downList} from '../../service/getPixivImgOriginal';

var mainObj = {

    contrl: async (ctx, next) => {
        ctx.body = {
            code: 200,
            content: '为啥没有返回值..'
        }
        var data = JSON.parse(ctx.request.body.downList);
        ctx.body.content = downList(data);

        
    }
}


export default mainObj