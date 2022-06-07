import { FindOptions, IncludeOptions, Optional } from 'sequelize';

export const BaseImages = {
    attributes: ['id', 'title', 'previewUrl', 'totalBookmarks', 'totalView', 'originUrlJson']
};

export const BaseTags = {
    attributes: ['name', 'translatedName', 'customName']
};

export const BaseAuthor = {
    attributes: ['name', 'profileImageUrl']
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
