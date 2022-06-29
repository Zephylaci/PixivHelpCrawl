import { FindOptions, IncludeOptions, Optional } from 'sequelize';

export const BaseImages = {
    attributes: [
        'id',
        'title',
        'previewUrl',
        'totalBookmarks',
        'totalView',
        'originUrlJson',
        'sanityLevel',
        'likeLevel',
        'createTime'
    ]
};

export const BaseTags = {
    attributes: ['name', 'translatedName', 'customName', 'likeLevel']
};

export const BaseAuthor = {
    attributes: ['id', 'name', 'profileImageUrl']
};

export interface ImageRuleType {
    imageAttr?: FindOptions;
    tagAttr?: IncludeOptions;
    authorAttr?: IncludeOptions;
}

export const DefaultImageRule = {
    imageAttr: BaseImages,
    tagAttr: BaseTags,
    authorAttr: BaseAuthor
};
