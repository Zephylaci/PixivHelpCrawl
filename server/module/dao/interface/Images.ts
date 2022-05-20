import { getDbControl } from '../index';
import { BaseImages, BaseTags, BaseAuthor } from '../define';
import { FindOptions, IncludeOptions, Optional } from 'sequelize';
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

export async function saveImageInfo({ image, tags, author }: ImageParams) {
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
                    attributes: ['id'],
                    defaults: item,
                    transaction
                });
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
                authorItem = await Author.create(author, { transaction });
            }
            await imageItem.setAuthor(authorItem, { transaction });
        }

        return imageItem;
    });
}

export async function getImageInfo(
    id: number,
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
    const Tags = ctx.model('Tags');
    const Author = ctx.model('Author');
    const Images = ctx.model('Images');

    let queryParams: FindOptions = {
        where: {
            id
        }
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
    return await Images.findOne(queryParams);
}
