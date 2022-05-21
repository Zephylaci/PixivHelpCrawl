import { getDbControl } from '../index';
import { BaseImages, BaseTags, BaseAuthor } from '../define';
import { FindOptions, IncludeOptions, Optional } from 'sequelize';
import { PixivIllust } from '../../pixiv-api/PixivTypes';
import { saveImageInfo } from './Images';
import { parseImgItem } from '../../../utils/gotPixivImg';
import { loggerShow } from '../../../utils/logger';

interface rankingInter extends Optional<any, string> {
    date: string;
    mode: string;
}

interface illustsItem extends PixivIllust {
    [x: string]: any;
}

interface RankingParams {
    ranking: rankingInter;
    illusts: Array<illustsItem>;
    startOffset: number;
}

export async function saveRanking({
    ranking: { date, mode },
    illusts,
    startOffset
}: RankingParams) {
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

export async function getRanking(
    { date, mode, offset = 0, limit = 30 },
    rule: {
        imageAttr?: FindOptions;
        tagAttr?: IncludeOptions;
        authorAttr?: IncludeOptions;
    } = {
        imageAttr: BaseImages,
        tagAttr: BaseTags,
        authorAttr: BaseAuthor
    }
) {
    const ctx = await getDbControl();
    const Ranking = ctx.model('Ranking');
    const Tags = ctx.model('Tags');
    const Author = ctx.model('Author');

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

    let queryParams: any = {
        offset,
        limit,
        through: { attributes: [] },
        order: [['totalBookmarks', 'DESC']]
    };

    if (rule.imageAttr) {
        queryParams = {
            ...queryParams,
            ...rule.imageAttr
        };
    }
    if (rule.tagAttr || rule.authorAttr) {
        queryParams.include = [];
        if (rule.tagAttr) {
            queryParams.include.push({
                model: Tags,
                through: { attributes: [] },
                as: 'tags',
                ...rule.tagAttr
            });
        }
        if (rule.authorAttr) {
            queryParams.include.push({
                model: Author,
                as: 'author',
                ...rule.authorAttr
            });
        }
    }

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
