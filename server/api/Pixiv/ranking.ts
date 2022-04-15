// 路由设置
import * as Router from 'koa-router';
import { resultBean } from '../../type/bean/resultBean';
import pixivClient from '../../module/pixiv-api/index';

type rankingParams = {
    date: string; //'2020-01-01',
    mode: string; // day week month day_r18 week_r18 week_r18g
    offset: number; // 用来分页，一页30个左右
};

type rankingRes = {
    illusts: Array<any>;
    nextUrl: string | null;
};

const main = new Router();
main.post('/ranking', async function (ctx) {
    const res: resultBean = ctx.body;
    const params: rankingParams = ctx.request.body;
    // console.log(params);
    // return
    res.code = 200;
    const body: rankingRes = await pixivClient.illustRanking(params as any).catch(error => {
        return {
            illusts: [],
            nextUrl: ''
        };
    });
    let next = null;
    if (body.nextUrl) {
        const url = new URL(body.nextUrl);
        next = url.searchParams.get('offset');
    }

    res.contents = {
        illusts: body.illusts,
        next
    };
});

export default main.routes();
