import { getDbControl } from '../index';
import { DefaultImageRule, ImageRuleType } from '../define';
import { makeImageParamsFromRule } from '../utils';
import { FindAttributeOptions, Op } from 'sequelize';
import { loggerErr } from '../../../utils/logger';
import { transDbResult } from '../../../utils/gotPixivImg';

const AuthorsAttributes: FindAttributeOptions = [
    'id',
    'name',
    'account',
    'profileImageUrl',
    'likeLevel',
    'imageCount'
];

export async function getAuthors({ offset, limit, sorter }) {
    const ctx = await getDbControl();
    const Authors = ctx.model('Author');
    let order: any = [['createTime', 'DESC']];
    if (Array.isArray(sorter) && sorter.length > 0) {
        order = sorter.map(item => {
            if (item[0] === 'imageCount') {
                return ctx.literal(`imageCount ${item[1]}`);
            }
            return item;
        });
    }

    return await Authors.findAndCountAll({
        limit,
        offset,
        attributes: AuthorsAttributes,
        order
    });
}

export async function getAuthorList({ offset, limit, sorter = [], search = null }) {
    const ctx = await getDbControl();
    const Authors = ctx.model('Author');

    const where = {};
    let order: any = [['likeLevel', 'DESC']];
    if (Array.isArray(sorter) && sorter.length > 0) {
        order = sorter.map(item => {
            return item;
        });
    }

    if (search) {
        const keyWord = search;
        const attributes = ['name', 'customName', 'translatedName'];
        const type = 'substring';
        where[Op.or] = [];
        attributes.forEach(key => {
            where[Op.or].push({
                [key]: { [Op[type]]: keyWord }
            });
        });
    }

    return await Authors.findAll({
        limit,
        offset,
        where,
        attributes: AuthorsAttributes,
        order
    });
}
export async function getAuthorInfo(where, attributes: FindAttributeOptions = AuthorsAttributes) {
    const ctx = await getDbControl();
    const Author = ctx.model('Author');
    return await Author.findOne({
        where,
        attributes
    });
}

export async function getAuthorImages(
    { where, offset, limit },
    rule: ImageRuleType = transDbResult(DefaultImageRule)
) {
    let res = [];
    try {
        const item: any = await getAuthorInfo(where, ['id']);

        const queryImage = await makeImageParamsFromRule({
            queryParams: {
                offset,
                limit,
                order: [['totalBookmarks', 'DESC']]
            },
            rule
        });
        if (queryImage) {
            const list = await item.getImages(queryImage);
            res = list;
        }
    } catch (error) {
        loggerErr.error('getTagImages:', error);
    }

    return res;
}

export async function updateAuthor({ id, likeLevel }) {
    const item: any = await getAuthorInfo(id, ['id']);
    if (item) {
        if (likeLevel !== null || likeLevel !== undefined) {
            item.likeLevel = likeLevel;
        }
        return await item.save();
    }

    return null;
}
