import { downList} from '../../service/getPixivImgOriginal';

var mainObj = {

    contrl: async (ctx, next) => {
        var data = JSON.parse(ctx.request.body.downList);
        ctx.body.content = downList(data);
        ctx.body.code = 200;        
    }
}


export default mainObj