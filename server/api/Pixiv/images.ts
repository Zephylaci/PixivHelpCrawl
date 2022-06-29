// 路由设置
import Router from 'koa-router';
import { Op } from 'sequelize';
import { getImageInfo, getImages } from '../../module/dao/interface/Images';
import { getIllustInfo } from '../../service/handlePixiv';
import { resultBean } from '../../type/bean/resultBean';
import { tansIllustsItem, filterIllustsList, transDbResult } from '../../utils/gotPixivImg';
import { loggerErr } from '../../utils/logger';
import { parseSorter } from '../../utils/tool';

const main = new Router();

main.get('/image/:id', async function (ctx) {
    const res: resultBean = ctx.body;
    const { id } = ctx.params;
    res.code = 200;
    res.contents = tansIllustsItem(await getIllustInfo(id));
});

/**
 * TODO:
 *     过滤
 *     排序：时间，访问量，收藏量
 *     判断：健全等级 小于 1 3 5 7 9
 *     tag相关操作：且，或，tag对应的缓存和管理
 */
main.post('/imageList', async function (ctx) {
    const res: resultBean = ctx.body;
    const params: any = ctx.request.body;
    const {
        offset = 0,
        limit = 90,
        sanityLevel = 5,
        needFilter = true,
        sortKey,
        sortMode,
        sanityMode,
        tags,
        tagMode
    } = params;

    let sorter = undefined;
    if (sortKey) {
        sorter = parseSorter([
            {
                field: sortKey,
                order: sortMode || 'descend'
            }
        ]);
    }
    let where = undefined;
    if (sanityLevel) {
        const Key = sanityMode === 'lt' ? 'lt' : 'gt';
        where = {
            sanityLevel: {
                [Op[Key]]: sanityLevel
            }
        };
    }

    let tagConfig = undefined;
    if (Array.isArray(tags) && tags.length > 0) {
        tagConfig = {
            tags,
            mode: tagMode || 'and'
        };
    }

    // 暂时不知道怎么样写能从数据查询里排除tags
    if (tagMode === 'not') {
        tagConfig = undefined;
    }

    res.code = 200;
    const list: any = await getImages({
        offset,
        limit,
        sorter,
        where,
        tagConfig
    });

    const resList = transDbResult(list).map(tansIllustsItem);
    res.contents = {
        illusts: needFilter ? filterIllustsList(resList) : resList,
        num: list.length
    };
});

main.post('/updateImageLike', async function (ctx) {
    const res: resultBean = ctx.body;
    const params: any = ctx.request.body;
    const { id, name, like } = params;

    res.code = 200;
    if (id && typeof like === 'number') {
        res.contents = {
            success: false
        };
        try {
            const item: any = await getImageInfo(id, {
                imageAttr: {
                    attributes: ['id', 'likeLevel']
                }
            });
            if (item) {
                item.likeLevel += like;
                await item.save();
                res.contents.success = true;
            }
        } catch (error) {
            loggerErr.error('updateImageLike error', error);
        }
    } else {
        res.contents = null;
        res.text = '入参错误';
    }
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
