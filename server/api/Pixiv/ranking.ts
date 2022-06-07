// 路由设置
import Router from 'koa-router';
import { resultBean } from '../../type/bean/resultBean';
import { pixivMode, ResIllustsItem } from '../../type';
import { tansIllustsItem } from '../../utils/gotPixivImg';
import { getRankingIllusts } from '../../service/handlePixiv';
import { loggerErr } from '../../utils/logger';

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
main.post('/ranking', async function (ctx) {
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

export default main.routes();
