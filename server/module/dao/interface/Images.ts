import { getDbControl } from '../index';
import { DefaultImageRule, ImageRuleType } from '../define';
import { FindOptions, Op, Optional, Sequelize } from 'sequelize';
import { makeImageParamsFromRule } from '../utils';
import { LockHandler, retryWarp } from '../../../utils/tool';
import { transDbResult } from '../../../utils/gotPixivImg';

interface ImageInter extends Optional<any, string> {
    id: number;
    title: string;
    previewUrl: string;
    originUrlJson: string;
    sanityLevel?: number;
    totalBookmarks?: number;
    totalView?: number;
    type?: string;
    height?: number;
    width?: number;
}

interface TagInter extends Optional<any, string> {
    name: string;
    translatedName?: string;
    customName?: string;
}

interface AuthorInter extends Optional<any, string> {
    id: string;
    name: string;
    account: string;
    profileImageUrl: string;
}

interface ImageParams extends Optional<any, string> {
    image: ImageInter;
    tags: Array<TagInter>;
    author: AuthorInter;
}

async function _saveImageInfo({ image, tags, author }: ImageParams) {
    const ctx = await getDbControl();
    const Tags = ctx.model('Tags');
    const Author = ctx.model('Author');
    const Images = ctx.model('Images');

    return await ctx.transaction(async transaction => {
        const imageItem: any = await Images.create(image, { transaction });
        if (Array.isArray(tags)) {
            const aboutTags = [];
            for (const item of tags) {
                const [tag]: any = await Tags.findOrCreate({
                    where: {
                        name: item.name
                    },
                    attributes: ['id', 'translatedName'],
                    defaults: item,
                    transaction
                });

                if (tag.translatedName !== item.translatedName) {
                    tag.translatedName = item.translatedName;
                    await tag.save({ transaction });
                }
                aboutTags.push(tag);
            }
            const tagSet = new Set();

            await imageItem.setTags(
                aboutTags.filter(item => {
                    const have = tagSet.has(item.id);
                    tagSet.add(item.id);
                    return !have;
                }),
                { transaction }
            );
        }

        if (author && author.id) {
            let authorItem: any = await Author.findOne({
                where: {
                    id: author.id
                }
            });
            if (!authorItem) {
                authorItem = await Author.create(
                    {
                        ...author,
                        imageCount: 1
                    },
                    { transaction }
                );
            } else {
                authorItem.imageCount++;
                await authorItem.save({ transaction });
            }
            await imageItem.setAuthor(authorItem, { transaction });
        }

        return imageItem;
    });
}

export const saveImageInfo = LockHandler.warpQuery(retryWarp(_saveImageInfo), {
    key: 'saveImageInfo',
    makeCashKey: ({ image }) => image.id
});

export async function getImageInfo(
    id: number | string,
    rule: ImageRuleType = transDbResult(DefaultImageRule)
) {
    const ctx = await getDbControl();
    const Images = ctx.model('Images');

    const queryParams: FindOptions = await makeImageParamsFromRule({
        queryParams: {
            where: {
                id
            }
        },
        rule
    });

    return await Images.findOne(queryParams);
}

export async function getImages(
    { offset, limit, sorter, where = undefined, tagConfig = {} }: any,
    rule: ImageRuleType = transDbResult(DefaultImageRule)
) {
    const ctx = await getDbControl();
    const Images = ctx.model('Images');

    let order: any = [];
    if (Array.isArray(sorter) && sorter.length > 0) {
        order = sorter.map(item => {
            return item;
        });
    }

    let tagMode = null;
    let tagParams: any = {};

    if (Array.isArray(tagConfig.tags)) {
        const { tagMode, tagType } = tagConfig;
        if (tagType === 'tag') {
            const Handler = {
                and: 'in',
                or: 'or'
            };

            rule.tagAttr.through = {
                attributes: [],
                where: {
                    TagId: {
                        [Op[Handler[tagMode]]]: tagConfig.tags
                    }
                }
            };

            if (tagMode === 'and') {
                tagParams = {
                    group: ['Images.id'],
                    having: Sequelize.literal(
                        `COUNT( DISTINCT tags.id ) = ${tagConfig.tags.length}`
                    ),
                    subQuery: false
                };
            }
        } else if (tagType === 'author') {
            where = where || {};
            where['authorId'] = {
                [Op.or]: tagConfig.tags
            };
        }
    }

    const queryParams: FindOptions = await makeImageParamsFromRule({
        queryParams: {
            offset,
            limit,
            order,
            where,
            ...tagParams
        },
        rule
    });

    const list: any = await Images.findAll(queryParams);
    const result = transDbResult(list);
    if (tagMode) {
        for (let i = 0; i < result.length; i++) {
            result[i].tags = await list[i].getTags();
        }
    }

    return result;
}
