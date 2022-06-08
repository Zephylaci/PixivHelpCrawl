import { getDbControl } from '../index';
import { DefaultImageRule, ImageRuleType } from '../define';
import { makeImageParamsFromRule } from '../utils';
import { Sequelize, FindAttributeOptions } from 'sequelize';

const TagAttributes: FindAttributeOptions = [
    'id',
    'name',
    'translatedName',
    'customName',
    'likeLevel',
    [
        Sequelize.literal(`(
            SELECT COUNT(*)
            FROM ImagesTags AS ImagesTags
            WHERE
            ImagesTags.tagId = Tags.id
        )`),
        'imageCount'
    ]
];

export async function getTags({ offset, limit, sorter }) {
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

export async function getTagInfo(where, attributes: FindAttributeOptions = TagAttributes) {
    const ctx = await getDbControl();
    const Tags = ctx.model('Tags');
    return await Tags.findOne({
        where,
        attributes
    });
}

export async function getTagImages(
    { where, offset, limit },
    rule: ImageRuleType = DefaultImageRule
) {
    const tagItem: any = await getTagInfo(where, ['id']);

    const queryImage = await makeImageParamsFromRule({
        queryParams: {
            offset,
            limit,
            order: [['totalBookmarks', 'DESC']]
        },
        rule
    });

    return await tagItem.getImages(queryImage);
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
