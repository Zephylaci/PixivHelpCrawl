// 路由设置
import Router from 'koa-router';
import { resultBean } from '../../type/bean/resultBean';
import {
    getTagPages,
    getTagList,
    getTagImages,
    getTagInfo,
    updateTag
} from '../../module/dao/interface/Tags';
import { parseSorter } from '../../utils/tool';
import { tansIllustsItem, transDbResult } from '../../utils/gotPixivImg';
import { loggerErr } from '../../utils/logger';

type params = {
    offset: number;
    limit: number;
    sort: any;
};

const main = new Router();

/*
  表格用带页码分页
**/
main.post('/tagPages', async function (ctx) {
    const res: resultBean = ctx.body;
    const params: params = ctx.request.body;
    const { offset = 0, limit = 20, sort } = params;

    let sorter = undefined;
    if (sort) {
        sorter = parseSorter(sort);
    }
    res.code = 200;
    res.contents = await getTagPages({ offset, limit, sorter });
});

/*
  其它场合使用
**/
main.post('/tagList', async function (ctx) {
    const res: resultBean = ctx.body;
    const params: any = ctx.request.body;
    const { offset = 0, limit = 20, sort, search } = params;

    let sorter = undefined;
    if (sort) {
        sorter = parseSorter(sort);
    }
    res.code = 200;
    res.contents = await getTagList({
        offset,
        limit,
        sorter,
        search
    });
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
