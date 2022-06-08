// 路由设置
import Router from 'koa-router';
import { resultBean } from '../../type/bean/resultBean';
import { getTags, getTagImages, getTagInfo, updateTag } from '../../module/dao/interface/Tags';
import { parseSorter } from '../../utils/tool';
import { tansIllustsItem, transDbResult } from '../../utils/gotPixivImg';

type params = {
    offset: number;
    limit: number;
    sort: any;
};

const main = new Router();

main.post('/tags', async function (ctx) {
    const res: resultBean = ctx.body;
    const params: params = ctx.request.body;
    const { offset = 0, limit = 50, sort } = params;
    let sorter = undefined;
    if (Array.isArray(sort)) {
        sorter = parseSorter(sort);
    }

    res.code = 200;
    res.contents = await getTags({ offset, limit, sorter });
});

main.get('/tagImages', async function (ctx) {
    const res: resultBean = ctx.body;
    const params = ctx.query;
    const { id, name, offset = 0, limit = 50 } = params;

    if (id || name) {
        let where = id ? { id } : { name };
        const list = await getTagImages({ where, offset, limit });

        res.code = 200;
        res.contents = {
            illusts: transDbResult(list).map(tansIllustsItem)
        };
    } else {
        res.contents = null;
        res.text = '入参错误';
    }
});

main.get('/tagInfo', async function (ctx) {
    const res: resultBean = ctx.body;
    const params = ctx.query;
    const { id, name } = params;
    res.code = 200;
    if (id || name) {
        let where = id ? { id } : { name };
        res.contents = await getTagInfo(where);
    } else {
        res.contents = null;
        res.text = '入参错误';
    }
});

main.post('/updateTag', async function (ctx) {
    const res: resultBean = ctx.body;
    const params: any = ctx.request.body;
    const { id, likeLevel, customName } = params;

    res.code = 200;
    let dbRes = await updateTag({ id, likeLevel, customName });
    res.contents = {
        success: dbRes ? true : false
    };
});
export default main.routes();
