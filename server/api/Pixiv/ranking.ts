// 路由设置
import Router from 'koa-router';
import { resultBean } from '../../type/bean/resultBean';
import { pixivMode } from '../../type';
import { getRankingIllusts } from '../../service/handlePixiv';

type rankingParams = {
    date: string; //'2020-01-01',
    mode: string; // day week month day_r18 week_r18 week_r18g
    offset: number;
    limit: number;
};

const main = new Router();
main.post('/ranking', async function (ctx) {
    const res: resultBean = ctx.body;
    const params: rankingParams = ctx.request.body;
    const { date, mode, offset = 0, limit = 90 } = params;

    res.contents = {
        illusts: []
    };
    if (!pixivMode.includes(mode)) {
        res.code = 400;
        res.text = '未知的mode';
        return;
    }

    res.code = 200;
    const result = await getRankingIllusts({ date, mode, offset, limit });
    res.contents = {
        ...res.contents,
        ...result
    };
});

export default main.routes();
