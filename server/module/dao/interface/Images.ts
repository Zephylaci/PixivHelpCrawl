import { getDbControl } from '../index';
import { DefaultImageRule, ImageRuleType } from '../define';
import { FindOptions, Optional } from 'sequelize';
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

            await imageItem.setTags(aboutTags, { transaction });
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

export async function getImageInfo(id: number | string, rule: ImageRuleType = {...DefaultImageRule}) {
    const ctx = await getDbControl();
    const Images = ctx.model('Images');

    const image: any = await Images.findOne({
        where: {
            id
        }
    });

    const res = transDbResult(image);
    if (image && rule.tagAttr) {
        res.tags = await image.getTags({
            ...rule.tagAttr
        });
    }

    if (image && rule.authorAttr) {
        res.author = await image.getAuthor({
            ...rule.authorAttr
        });
    }

    return res;
}

export async function getImages({ offset, limit }, rule: ImageRuleType = {...DefaultImageRule}) {
    const ctx = await getDbControl();
    const Images = ctx.model('Images');

    const queryParams: FindOptions = await makeImageParamsFromRule({
        queryParams: {
            offset,
            limit
        },
        rule
    });

    return await Images.findAll(queryParams);
}
