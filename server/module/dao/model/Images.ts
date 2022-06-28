import { DataTypes } from 'sequelize';
import { dbClient } from '../sqlite';

export const Images = dbClient.define(
    'Images',
    {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            primaryKey: true,
            autoIncrement: true
        },
        title: DataTypes.STRING,
        previewUrl: DataTypes.STRING,
        // 缓存所有预览图及原图的信息组成的json
        /*
            imageUrls: {,…} // large,medium,squareMedium
            metaPages: [{imageUrls: {,…}}, {imageUrls: {,…}}, {imageUrls: {,…}}] // large,medium,original,squareMedium
            metaSinglePage: {}
            pageCount: 3
            originalImageUrl:string  // metaSinglePage: {originalImageUrl: ""}    
        */
        originUrlJson: DataTypes.TEXT,
        // 健全等级 0 2 4 6 越高似乎越不健康
        sanityLevel: DataTypes.TINYINT,
        likeLevel: {
            type: DataTypes.TINYINT,
            defaultValue: 0
        },
        totalBookmarks: DataTypes.INTEGER,
        totalView: DataTypes.INTEGER,
        type: DataTypes.STRING(50),
        height: DataTypes.MEDIUMINT,
        width: DataTypes.MEDIUMINT
    },
    {
        tableName: 'imgStorage',
        createdAt: 'createTime',
        updatedAt: 'updateTime',
        indexes: [
            {
                fields: ['authorId', 'id']
            },
            {
                fields: ['createTime']
            },
            {
                fields: ['sanityLevel']
            },
            {
                fields: ['totalBookmarks']
            },
            {
                fields: ['totalView']
            },
            {
                fields: ['likeLevel']
            }
        ]
    }
);
