// 路由设置
import Router from 'koa-router';
import { resultBean } from '../../type/bean/resultBean';
import { pixivMode } from '../../type';
import { getRankingIllusts } from '../../service/handlePixiv';
import { transPreviewUrl } from '../../utils/gotPixivImg';

type rankingParams = {
    date: string; //'2020-01-01',
    mode: string; // day week month day_r18 week_r18 week_r18g
    offset: number;
    limit: number;
};

type illustsItem = {
    id: number;
    title: string;
    previewUrl: string;
    totalBookmarks: number;
    totalView: number;
    tags: Array<any>;
    author: any;
    count: number;
    metaPages?: Array<string>;
};

type rankingContents = {
    success: boolean;
    illusts: Array<illustsItem>;
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
    const result = await getRankingIllusts({ date, mode, offset, limit });

    res.text = result.text;
    contents.success = result.success;
    contents.illusts = result.illusts.map(
        ({ originUrlJson, id, title, previewUrl, totalBookmarks, totalView, tags, author }) => {
            const origin: any = JSON.parse(originUrlJson);
            const item: illustsItem = {
                id,
                title,
                previewUrl,
                totalBookmarks,
                totalView,
                tags,
                author,
                count: origin.pageCount
            };
            if (origin.pageCount > 1) {
                item.metaPages = origin.metaPages.map(({ imageUrls }) => {
                    const { squareMedium, medium, large } = imageUrls;
                    const previewUel = medium || squareMedium || large;
                    return transPreviewUrl(previewUel);
                });
            }
            return item;
        }
    );

    res.contents = contents;
});

export default main.routes();
