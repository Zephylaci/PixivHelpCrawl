// 路由设置
import Router from 'koa-router';
import dayjs from 'dayjs';
import { resultBean } from '../../type/bean/resultBean';
import pixivClient from '../../module/pixiv-api/index';
import { pixivMode } from '../../type';

type rankingParams = {
    date: string; //'2020-01-01',
    mode: string; // day week month day_r18 week_r18 week_r18g
    offset: number;
    limit: number;
};

type rankingRes = {
    illusts: Array<any>;
    nextUrl: string | null;
};

const main = new Router();
main.post('/ranking', async function (ctx) {
    const res: resultBean = ctx.body;
    const params: rankingParams = ctx.request.body;
    const { date, mode, offset = 0, limit = 100, ...other } = params;

    res.contents = {
        illusts: []
    };
    if (!pixivMode.includes(mode)) {
        res.code = 400;
        res.text = '未知的mode';
        return;
    }

    res.code = 200;

    for (let i = offset; i < limit; ) {
        const queryParams = {
            date: dayjs(date).format('YYYY-MM-DD'),
            mode,
            offset: i,
            ...other
        };
        const body: rankingRes = await pixivClient
            .illustRanking(queryParams as any)
            .catch(error => {
                return {
                    illusts: [],
                    nextUrl: ''
                };
            });
        res.contents.illusts.push(...body.illusts);
        if (body.nextUrl) {
            const url = new URL(body.nextUrl);
            i = Number(url.searchParams.get('offset'));
        } else {
            break;
        }
        console.log(i);
    }
});

export default main.routes();
