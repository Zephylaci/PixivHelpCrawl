// 路由设置
import Router from 'koa-router';
import { resultBean } from '../../type/bean/resultBean';
import { getTags, getTagImages, getTagInfo, updateTag } from '../../module/dao/interface/Tags';
import { parseSorter } from '../../utils/tool';
import { tansIllustsItem, transDbResult } from '../../utils/gotPixivImg';
import { loggerErr } from '../../utils/logger';

type params = {
    offset: number;
    limit: number;
    sort: any;
};

const main = new Router();

main.get('/tags', async function (ctx) {
    const res: resultBean = ctx.body;
    const params: params = ctx.query as any;
    const { offset = 0, limit = 50 } = params;
    let { sort } = params;
    let sorter = undefined;
    try {
        if (typeof sort === 'string') {
            sort = JSON.parse(sort);
        }
        if (Array.isArray(sort)) {
            sorter = parseSorter(sort);
        }
    } catch (error) {
        loggerErr.error('tags sort error:', sort, typeof sort);
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

main.post('/updateTagLike', async function (ctx) {
    const res: resultBean = ctx.body;
    const params: any = ctx.request.body;
    const { id, name, like } = params;

    res.code = 200;
    if (id || (name && typeof like === 'number')) {
        res.contents = {
            success: false
        };
        try {
            const where = id ? { id } : { name };
            const item: any = await getTagInfo(where, ['id', 'likeLevel']);
            if (item) {
                item.likeLevel += like;
                await item.save();
                res.contents.success = true;
            }
        } catch (error) {
            loggerErr.error('updateTagLike error', error);
        }
    } else {
        res.contents = null;
        res.text = '入参错误';
    }
});

export default main.routes();
