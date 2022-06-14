import { getDbControl } from '../index';
import { FindOptions, Optional } from 'sequelize';
import { saveImageInfo } from './Images';
import { parseImgItem } from '../../../utils/gotPixivImg';
import { loggerShow } from '../../../utils/logger';
import { DefaultImageRule, ImageRuleType } from '../define';
import { makeImageParamsFromRule } from '../utils';
import { IllustsItem } from '../../../type/';
import { retryWarp, StackHandler } from '../../../utils/tool';
import { Sequelize, Op } from 'sequelize';

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
        const count = await ranking.countImages();
        ranking.imageCount = count;
        await ranking.save();
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
    { where, offset = 0, limit = 30 },
    rule: ImageRuleType = DefaultImageRule
) {
    const ctx = await getDbControl();
    const Ranking = ctx.model('Ranking');

    const ranking: any = await Ranking.findOne({
        where,
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

export async function getRankingFromArrId(
    { ids, offset = 0, limit = 30 },
    rule: ImageRuleType = DefaultImageRule
) {
    const ctx = await getDbControl();
    const RankingImages = ctx.model('RankingImages');
    const Images = ctx.model('Images');
    const queryParams: any = await makeImageParamsFromRule({
        rule
    });
    try {
        return await RankingImages.findAll({
            where: {
                [Op.or]: ids.map(id => {
                    return {
                        RankingId: id
                    };
                })
            },
            group: 'ImageId',
            include: {
                model: Images,
                ...queryParams
            },
            attributes: ['ImageId'],
            offset,
            limit
        });
    } catch (error) {
        console.log('check:', error);
    }
    return [];
}

export async function getRankingInfo({ date, mode }) {
    const ctx = await getDbControl();
    const Ranking = ctx.model('Ranking');

    const ranking: any = await Ranking.findOne({
        where: {
            date,
            mode
        },
        attributes: ['id', 'startOffset', 'imageCount']
    });
    if (!ranking) {
        return ranking;
    }
    return {
        count: ranking.imageCount,
        startOffset: ranking.startOffset
    };
}

export async function getRankingPages({ mode, dateRange, sorter, offset, limit }) {
    const ctx = await getDbControl();
    const Ranking = ctx.model('Ranking');
    let order = undefined;
    if (Array.isArray(sorter) && sorter.length > 0) {
        order = sorter.map(item => {
            return item;
        });
    }

    const where: any = {};
    if (Array.isArray(mode) && mode.length > 0) {
        where[Op.or] = mode.map(key => {
            return {
                mode: key
            };
        });
    }
    if (Array.isArray(dateRange) && dateRange.length == 2) {
        const [start, end] = dateRange;
        where.date = {
            [Op.lte]: end,
            [Op.gte]: start
        };
    }
    return await Ranking.findAndCountAll({
        where,
        limit,
        offset,
        attributes: ['id', 'date', 'mode', 'imageCount', 'startOffset'],
        order
    });
}
