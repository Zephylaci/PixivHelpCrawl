// 路由设置
import Router from 'koa-router';
import { resultBean } from '../../type/bean/resultBean';
import { pixivMode, ResIllustsItem } from '../../type';
import { tansIllustsItem, transDbResult } from '../../utils/gotPixivImg';
import { getRankingIllusts, getRankingIllustsFromPixiv } from '../../service/handlePixiv';
import { loggerErr } from '../../utils/logger';
import { parseSorter } from '../../utils/tool';
import {
    getRanking,
    getRankingFromArrId,
    getRankingInfo,
    getRankingPages
} from '../../module/dao/interface/Ranking';
import dayjs from 'dayjs';

type rankingParams = {
    date: string; //'2020-01-01',
    mode: string; // day week month day_r18 week_r18 week_r18g
    offset: number;
    limit: number;
};

type rankingContents = {
    success: boolean;
    illusts: Array<ResIllustsItem>;
};

const main = new Router();
main.post('/queryRanking', async function (ctx) {
    const res: resultBean = ctx.body;
    const params: rankingParams = ctx.request.body;
    const { date, mode, offset = 0, limit = 90 } = params;
    const contents: rankingContents = {
        illusts: [],
        success: false
    };

    if (!pixivMode.includes(mode)) {
        res.code = 400;
        res.text = '未知的mode';
        return;
    }

    res.code = 200;
    try {
        const result = await getRankingIllusts({ date, mode, offset, limit });
        res.text = result.text;
        contents.success = result.success;
        contents.illusts = result.illusts.map(tansIllustsItem);
    } catch (error) {
        res.code = 500;
        res.text = '服务繁忙';
        loggerErr.error(error);
    }

    res.contents = contents;
});

main.post('/rankingPages', async function (ctx) {
    const res: resultBean = ctx.body;
    const params: any = ctx.request.body;
    const { offset = 0, limit = 20, sort, mode, queryDate } = params;

    let sorter = undefined;
    if (sort) {
        sorter = parseSorter(sort);
    }
    let dateRange = [];
    if (Array.isArray(queryDate)) {
        dateRange = queryDate.map(date => dayjs(date).format('YYYY-MM-DD'));
    }
    res.code = 200;
    res.contents = await getRankingPages({ mode, dateRange, offset, limit, sorter });
});

main.post('/rankingImages', async function (ctx) {
    const res: resultBean = ctx.body;
    const params: any = ctx.request.body;
    const { id, offset, limit = 20 } = params;
    res.code = 200;
    if (id) {
        let list = [];
        if (Array.isArray(id)) {
            list = transDbResult(await getRankingFromArrId({ ids: id, offset, limit }));
            if (Array.isArray(list)) {
                list = list.map(({ Image }) => {
                    return Image;
                });
            }
        } else {
            list = transDbResult(await getRanking({ where: { id }, offset, limit }));
        }
        res.contents = {
            illusts: list.map(tansIllustsItem)
        };
    } else {
        res.contents = null;
        res.text = '入参错误';
    }
});

main.post('/addRanking', async function (ctx) {
    const res: resultBean = ctx.body;
    const params: any = ctx.request.body;
    const { limit = 90, mode, dateRange } = params;
    res.code = 200;
    if (Array.isArray(dateRange) && dateRange.length === 2 && mode) {
        const [start, end] = dateRange.map(date => dayjs(date));
        let now = start;
        while (now.valueOf() <= end.valueOf()) {
            const date = now.format('YYYY-MM-DD');
            mode.forEach(async key => {
                const info = await getRankingInfo({ date, mode });
                if ((info || { count: 0 }).count < limit) {
                    getRankingIllustsFromPixiv({ date, mode: key, offset: 0, limit });
                }
            });
            now = now.add(1, 'day');
        }
    } else {
        res.contents = null;
        res.text = '入参错误';
    }
});

export default main.routes();
