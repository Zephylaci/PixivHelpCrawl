import { getDbControl } from '../index';
import { FindOptions, Optional } from 'sequelize';
import { saveImageInfo } from './Images';
import { parseImgItem } from '../../../utils/gotPixivImg';
import { loggerShow } from '../../../utils/logger';
import { DefaultImageRule, ImageRuleType } from '../define';
import { makeImageParamsFromRule, retryWarp, StackHandler } from '../utils';
import { IllustsItem } from '../../../type/';

interface rankingInter extends Optional<any, string> {
    date: string;
    mode: string;
}

interface RankingParams {
    ranking: rankingInter;
    illusts: Array<IllustsItem>;
    startOffset: number;
}

async function _saveRanking({ ranking: { date, mode }, illusts, startOffset }: RankingParams) {
    const ctx = await getDbControl();
    const Images = ctx.model('Images');
    const Ranking = ctx.model('Ranking');

    let ranking: any = await Ranking.findOne({
        where: {
            date,
            mode
        }
    });

    if (!ranking) {
        ranking = await Ranking.create({ date, mode, startOffset });
    } else if (ranking.startOffset > startOffset) {
        ranking.startOffset = startOffset;
        await ranking.save();
    }

    if (Array.isArray(illusts)) {
        const images = [];
        for (const illust of illusts) {
            let imageItem: any = await Images.findOne({
                where: {
                    id: illust.id
                },
                attributes: ['id']
            });
            if (!imageItem) {
                imageItem = await saveImageInfo(parseImgItem(illust));
            }
            if (imageItem.id) {
                images.push(imageItem.id);
            } else {
                loggerShow.warn(`saveRanking:`, ranking, illust.id, JSON.stringify(imageItem));
            }
        }
        await ranking.addImages(images);
    }
    return ranking;
}

export const saveRanking = StackHandler.warpQuery(retryWarp(_saveRanking), {
    key: 'saveRanking',
    makeCashKey: ({ ranking: { date, mode }, startOffset }) => {
        return `${date}-${mode}-${startOffset}`;
    }
});

export async function getRanking(
    { date, mode, offset = 0, limit = 30 },
    rule: ImageRuleType = DefaultImageRule
) {
    const ctx = await getDbControl();
    const Ranking = ctx.model('Ranking');

    const ranking: any = await Ranking.findOne({
        where: {
            date,
            mode
        },
        attributes: ['id']
    });
    if (!ranking) {
        return ranking;
    }

    const queryParams: FindOptions = await makeImageParamsFromRule({
        queryParams: {
            offset,
            limit,
            through: { attributes: [] },
            order: [['totalBookmarks', 'DESC']]
        },
        rule
    });

    return await ranking.getImages(queryParams);
}

export async function getRankingInfo({ date, mode }) {
    const ctx = await getDbControl();
    const Ranking = ctx.model('Ranking');

    const ranking: any = await Ranking.findOne({
        where: {
            date,
            mode
        },
        attributes: ['id', 'startOffset']
    });
    if (!ranking) {
        return ranking;
    }
    const count = await ranking.countImages();

    return {
        count,
        startOffset: ranking.startOffset
    };
}
