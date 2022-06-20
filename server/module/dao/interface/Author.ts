import { getDbControl } from '../index';
import { DefaultImageRule, ImageRuleType } from '../define';
import { makeImageParamsFromRule } from '../utils';
import { FindAttributeOptions } from 'sequelize';
import { loggerErr } from '../../../utils/logger';

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
    rule: ImageRuleType = { ...DefaultImageRule }
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
