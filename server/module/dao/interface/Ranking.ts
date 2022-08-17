import { getDbControl } from '../index';
import { FindOptions, Optional } from 'sequelize';
import { saveImageInfo } from './Images';
import { parseImgItem, transDbResult } from '../../../utils/gotPixivImg';
import { loggerErr, loggerShow } from '../../../utils/logger';
import { DefaultImageRule, BaseTags, ImageRuleType } from '../define';
import { makeImageParamsFromRule } from '../utils';
import { IllustsItem } from '../../../type/';
import { retryWarp, StackHandler } from '../../../utils/tool';
import { Op } from 'sequelize';

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
    rule: ImageRuleType = transDbResult(DefaultImageRule)
) {
    let res: any = null;

    try {
        const ctx = await getDbControl();
        const Ranking = ctx.model('Ranking');
        const RankingImages = ctx.model('RankingImages');
        const Images = ctx.model('Images');
        const ranking: any = await Ranking.findOne({
            where,
            attributes: ['id']
        });
        if (!ranking) {
            return ranking;
        }

        const baseTagAttr = rule.tagAttr;
        rule.tagAttr = null;

        const ids: any = await RankingImages.findAll({
            where: {
                RankingId: ranking.id
            },
            attributes: ['ImageId'],
            offset,
            limit
        });

        const queryParams: FindOptions = await makeImageParamsFromRule({
            queryParams: {
                where: {
                    id: ids.map(({ ImageId }) => ImageId)
                },
                through: { attributes: [] },
                order: [['totalBookmarks', 'DESC']]
            },
            rule
        });
        const list = await Images.findAll(queryParams);
        res = list;
        if (list && baseTagAttr) {
            res = transDbResult(res);
            const promise = [];
            for (let i = 0; i < list.length; i++) {
                const item: any = list[i];
                const target = res[i];
                const query = item.getTags().then(res => {
                    target.tags = res;
                });
                promise.push(query);
            }
            await Promise.all(promise);
        }
    } catch (error) {
        loggerErr.error('getRanking:', error);
    }

    return res;
}

export async function getRankingFromArrId(
    { ids, offset = 0, limit = 30 },
    rule: ImageRuleType = transDbResult(DefaultImageRule)
) {
    let res = [];
    try {
        const ctx = await getDbControl();
        const RankingImages = ctx.model('RankingImages');
        const Images = ctx.model('Images');

        rule.tagAttr = {
            attributes: [...BaseTags.attributes, 'likeLevel']
        };
        const baseTagAttr = rule.tagAttr;
        rule.tagAttr = null;

        const queryParams: any = await makeImageParamsFromRule({
            rule
        });

        const list: any = await RankingImages.findAll({
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
            order: [[Images, 'totalBookmarks', 'DESC']],
            attributes: ['ImageId'],
            offset,
            limit
        });

        res = list;
        if (list && baseTagAttr) {
            res = transDbResult(res);
            const promise = [];
            for (let i = 0; i < list.length; i++) {
                const item = list[i];
                const target = res[i];
                const query = item.getTags().then(res => {
                    target.tags = res;
                });
                promise.push(query);
            }
            await Promise.all(promise);
        }
    } catch (error) {
        loggerErr.error('getRankingFromArrId:', error);
    }
    return res;
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
    let order: any = [['createTime', 'DESC']];
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
