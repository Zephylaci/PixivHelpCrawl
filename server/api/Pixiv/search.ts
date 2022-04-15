// 路由设置
import * as Router from 'koa-router';
import { resultBean } from '../../type/bean/resultBean';
import pixivClient from '../../module/pixiv-api/index';

type searchParams = {
    sort?: 'date_desc' | 'date_asc'; //date_desc按更新顺序; date_asc按旧到新顺序
    searchTarget?: 'partial_match_for_tags' | 'exact_match_for_tags' | 'title_and_caption'; // partial_match_for_tags标签部分一致; exact_match_for_tags标签完全一致; title_and_caption标题说明文
    duration?: 'within_last_day' | 'within_last_week' | 'within_last_month';
    startDate?: string;
    endDate?: string;
    word: 'string';
};

type rankingRes = {
    illusts: Array<any>;
    nextUrl: string | null;
};
const main = new Router();

main.post('/search', async function (ctx) {
    const res: resultBean = ctx.body;
    const params: searchParams = ctx.request.body;
    const { word, ...other } = params;
    res.code = 200;
    const body = await pixivClient.searchIllust(word, other);

    res.contents = body;
});

export default main.routes();
