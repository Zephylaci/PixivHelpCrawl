import { getImageInfo, saveImageInfo } from '../module/dao/interface/Images';
import { getRankingInfo, getRanking, saveRanking } from '../module/dao/interface/Ranking';
import { BaseImages } from '../module/dao/define';
import { parseImgItem, transDbResult } from '../utils/gotPixivImg';
import { pixivMode, DbIllustsItem, IllustsItem } from '../type';
import dayjs from 'dayjs';
import { loggerShow } from '../utils/logger';
import pixivClient from '../module/pixiv-api/index';
import { StackHandler } from '../utils/tool';

type rankingRes = {
    illusts: Array<any>;
    nextUrl: string | null;
};

export async function saveIllust(item: IllustsItem) {
    const id = item.id;
    const images = await getImageInfo(id, { imageAttr: { attributes: ['id'] } });
    if (!images) {
        try {
            await saveImageInfo(parseImgItem(item));
        } catch (error) {
            loggerShow.error('saveIllust:', error, JSON.stringify(item));
            return null;
        }
    }
    return id;
}

async function _getRankingIllustsFromPixiv({
    date,
    mode,
    offset,
    limit
}): Promise<Array<DbIllustsItem>> {
    let startOffset = offset;
    const illusts = [];
    for (let i = 0; i < limit; ) {
        const queryParams = {
            date,
            mode,
            offset
        };
        const body: rankingRes = await pixivClient
            .illustRanking(queryParams as any)
            .catch(error => {
                return {
                    illusts: [],
                    nextUrl: ''
                };
            });
        illusts.push(...body.illusts);
        i = illusts.length;
        if (body.nextUrl) {
            const url = new URL(body.nextUrl);
            offset = Number(url.searchParams.get('offset'));
        } else {
            break;
        }

        if (!Array.isArray(body.illusts) || body.illusts.length === 0) {
            break;
        }
    }

    // 缓存
    console.time(`${date}-${mode}-${startOffset}`);
    saveRanking({ ranking: { date, mode }, illusts, startOffset }).then(() => {
        console.timeEnd(`${date}-${mode}-${startOffset}`);
    });

    return illusts
        .map(item => {
            const { image, tags, author } = parseImgItem(item);
            let res: any = {
                tags,
                author
            };
            BaseImages.attributes.forEach(key => {
                res[key] = image[key];
            });
            return res;
        })
        .sort((a, b) => b.totalBookmarks - a.totalBookmarks);
}

export const getRankingIllustsFromPixiv = StackHandler.warpQuery(_getRankingIllustsFromPixiv, {
    key: 'getRankingIllustsFromPixiv',
    limit: 5,
    makeCashKey: ({ date, mode, offset, limit }) => {
        return `${date}-${mode}-${offset}-${limit}`;
    }
});

type RankingIllustsRes = {
    illusts: Array<DbIllustsItem>;
    success: boolean;
    text: string;
};

export async function getRankingIllusts({ date, mode, offset, limit }) {
    date = dayjs(date).format('YYYY-MM-DD');
    offset = Number(offset);
    limit = Number(limit);

    const res: RankingIllustsRes = {
        illusts: [],
        success: false,
        text: ''
    };

    if (!pixivMode.includes(mode) || isNaN(offset) || isNaN(limit)) {
        res.success = false;
        res.text = '未知的mode';
        return res;
    }
    res.success = true;
    const info = await getRankingInfo({ date, mode });
    if (info) {
        const { count, startOffset } = info;
        if (startOffset > offset || count < limit + offset) {
            res.illusts = await getRankingIllustsFromPixiv({ date, mode, offset, limit });
        } else {
            res.illusts = await getRanking({ where: { date, mode }, offset, limit });
        }
    } else {
        res.illusts = await getRankingIllustsFromPixiv({ date, mode, offset, limit });
    }

    return transDbResult(res);
}

export async function getIllustInfo(id) {
    let res = null;
    res = await getImageInfo(id);

    if (!res) {
        try {
            let queryRes = await pixivClient.illustDetail(id);
            if (queryRes.illust) {
                await saveIllust(queryRes.illust);
                res = await getImageInfo(id);
            }
        } catch (error) {
            console.log('error', error);
        }
    }

    return transDbResult(res);
}
