// 路由设置
import Router from 'koa-router';
import { getIllustInfo } from '../../service/handlePixiv';
import { resultBean } from '../../type/bean/resultBean';
import { tansIllustsItem } from '../../utils/gotPixivImg';

const main = new Router();

main.get('/image/:id', async function (ctx) {
    const res: resultBean = ctx.body;
    const { id } = ctx.params;
    res.code = 200;
    res.contents = tansIllustsItem(await getIllustInfo(id));
});

main.put('/image/update/:id', async function (ctx) {
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
