import { getDbControl } from '../index';
import { DefaultImageRule, ImageRuleType } from '../define';
import { makeImageParamsFromRule } from '../utils';
import { Sequelize, FindAttributeOptions, Op } from 'sequelize';
import { loggerErr } from '../../../utils/logger';
import { transDbResult } from '../../../utils/gotPixivImg';

const TagAttributes = ['id', 'name', 'translatedName', 'customName', 'likeLevel'];
const ImageCount = [
    Sequelize.literal(`(
        SELECT COUNT(*)
        FROM ImagesTags AS ImagesTags
        WHERE
        ImagesTags.tagId = Tags.id
    )`),
    'imageCount'
];

export async function getTagPages({ offset, limit, sorter }) {
    const ctx = await getDbControl();
    const Tags = ctx.model('Tags');
    let order = undefined;
    if (Array.isArray(sorter) && sorter.length > 0) {
        order = sorter.map(item => {
            if (item[0] === 'imageCount') {
                return ctx.literal(`imageCount ${item[1]}`);
            }
            return item;
        });
    }

    return await Tags.findAndCountAll({
        limit,
        offset,
        attributes: TagAttributes,
        order
    });
}

export async function getTagList({ offset, limit, sorter, search }) {
    const ctx = await getDbControl();
    const Tags = ctx.model('Tags');

    const where = {};

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
    return await Tags.findAll({
        limit,
        offset,
        where,
        attributes: TagAttributes,
        order: sorter
    });
}

export async function getTagInfo(where, attr = TagAttributes) {
    const ctx = await getDbControl();
    const Tags = ctx.model('Tags');

    const attributes = [...attr, ImageCount] as FindAttributeOptions;
    return await Tags.findOne({
        where,
        attributes
    });
}

export async function getTagImages(
    { where, offset, limit },
    rule: ImageRuleType = DefaultImageRule
) {
    let res = [];
    try {
        const item: any = await getTagInfo(where, ['id']);

        const baseTagAttr = rule.tagAttr;
        rule.tagAttr = null;

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
        }
    } catch (error) {
        loggerErr.error('getTagImages:', error);
    }

    return res;
}

export async function updateTag({ id, likeLevel, customName }) {
    const tagItem: any = await getTagInfo(id, ['id']);
    if (tagItem) {
        if (likeLevel !== null || likeLevel !== undefined) {
            tagItem.likeLevel = likeLevel;
        }
        if (customName !== null || customName !== undefined) {
            tagItem.customName = customName;
        }
        return await tagItem.save();
    }

    return null;
}
