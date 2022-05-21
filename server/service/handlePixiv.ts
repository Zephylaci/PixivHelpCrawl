import { getImageInfo, saveImageInfo } from '../module/dao/interface/Images';
import { getRankingInfo, getRanking, saveRanking } from '../module/dao/interface/Ranking';
import { BaseImages } from '../module/dao/define';
import { PixivIllust } from '../module/pixiv-api/PixivTypes';
import { parseImgItem } from '../utils/gotPixivImg';
import { loggerShow } from '../utils/logger';
import { pixivMode } from '../type';
import dayjs from 'dayjs';
import pixivClient from '../module/pixiv-api/index';

type rankingRes = {
    illusts: Array<any>;
    nextUrl: string | null;
};

export async function saveIllust(item: PixivIllust) {
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

async function getRankingIllustsFromPixiv({ date, mode, offset, limit }) {
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
    saveRanking({ ranking: { date, mode }, illusts, startOffset });

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

export async function getRankingIllusts({ date, mode, offset, limit }) {
    date = dayjs(date).format('YYYY-MM-DD');
    offset = Number(offset);
    limit = Number(limit);

    const res = {
        illusts: [],
        success: false,
        msg: ''
    };

    if (!pixivMode.includes(mode) || isNaN(offset) || isNaN(limit)) {
        res.success = false;
        res.msg = '未知的mode';
        return res;
    }
    res.success = true;
    const info = await getRankingInfo({ date, mode });

    if (info) {
        const { count, startOffset } = info;
        if (startOffset > offset || count < limit + offset) {
            res.illusts = await getRankingIllustsFromPixiv({ date, mode, offset, limit });
        } else {
            res.illusts = await getRanking({ date, mode, offset, limit });
        }
    } else {
        res.illusts = await getRankingIllustsFromPixiv({ date, mode, offset, limit });
    }

    return res;
}
