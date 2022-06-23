// 路由设置
import Router from 'koa-router';
import { resultBean } from '../../type/bean/resultBean';
import { parseSorter } from '../../utils/tool';
import { tansIllustsItem, transDbResult } from '../../utils/gotPixivImg';
import {
    getAuthorImages,
    getAuthorInfo,
    getAuthors,
    updateAuthor
} from '../../module/dao/interface/Author';
import { loggerErr } from '../../utils/logger';
import pixivClient from '../../module/pixiv-api/index';
import { getAuthorIllustsFromPixiv, saveIllust } from '../../service/handlePixiv';

type params = {
    offset: number;
    limit: number;
    sort: any;
};

const main = new Router();

main.post('/authorPages', async function (ctx) {
    const res: resultBean = ctx.body;
    const params: params = ctx.request.body;
    const { offset = 0, limit = 20, sort } = params;

    let sorter = undefined;
    if (sort) {
        sorter = parseSorter(sort);
    }
    res.code = 200;
    res.contents = await getAuthors({ offset, limit, sorter });
});

main.get('/authorImages', async function (ctx) {
    const res: resultBean = ctx.body;
    const params = ctx.query;
    const { id, name, offset = 0, limit = 50 } = params;

    if (id || name) {
        const where = id ? { id } : { name };
        const list = await getAuthorImages({ where, offset, limit });

        res.code = 200;
        res.contents = {
            illusts: transDbResult(list).map(tansIllustsItem)
        };
    } else {
        res.contents = null;
        res.text = '入参错误';
    }
});

main.post('/addAuthorImages', async function (ctx) {
    const res: resultBean = ctx.body;
    const params = ctx.request.body;
    const { id, offset = 0, limit = 90 } = params;
    console.log('check:', id, offset, limit);
    if (id) {
        res.code = 200;
        await getAuthorIllustsFromPixiv({ id, offset, limit });
    } else {
        res.contents = null;
        res.text = '入参错误';
    }
});

main.get('/authorInfo', async function (ctx) {
    const res: resultBean = ctx.body;
    const params = ctx.query;
    const { id, name } = params;

    res.code = 200;
    if (id || name) {
        const where = id ? { id } : { name };
        res.contents = await getAuthorInfo(where);
    } else {
        res.contents = null;
        res.text = '入参错误';
    }
});

main.post('/updateAuthor', async function (ctx) {
    const res: resultBean = ctx.body;
    const params: any = ctx.request.body;
    const { id, likeLevel } = params;

    res.code = 200;
    let dbRes = await updateAuthor({ id, likeLevel });
    res.contents = {
        success: dbRes ? true : false
    };
});

main.post('/updateAuthorLike', async function (ctx) {
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
            const item: any = await getAuthorInfo(where, ['id', 'likeLevel']);
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
