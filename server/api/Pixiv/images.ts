// 路由设置
import Router from 'koa-router';
import { getImages } from '../../module/dao/interface/Images';
import { getIllustInfo } from '../../service/handlePixiv';
import { resultBean } from '../../type/bean/resultBean';
import { tansIllustsItem, transDbResult } from '../../utils/gotPixivImg';

const main = new Router();

main.get('/image/:id', async function (ctx) {
    const res: resultBean = ctx.body;
    const { id } = ctx.params;
    res.code = 200;
    res.contents = tansIllustsItem(await getIllustInfo(id));
});

main.post('/imageList', async function (ctx) {
    const res: resultBean = ctx.body;
    const params: any = ctx.request.body;
    const { offset = 0, limit = 90 } = params;

    const list: any = await getImages({ offset, limit });
    res.contents = {
        illusts: transDbResult(list).map(tansIllustsItem)
    };
});

main.post('/updateImage', async function (ctx) {
    const res: resultBean = ctx.body;
    const params = ctx.query;
    const { id } = ctx.params;
    // const { offset = 0, limit = 50 } = params;
    // const list = await getTagImages({ id, offset, limit });

    // res.code = 200;
    // res.contents = {
    //     illusts: transDbResult(list).map(tansIllustsItem)
    // };
});

export default main.routes();
