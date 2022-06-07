import { DataTypes } from 'sequelize';
import { dbClient } from '../sqlite';
import { Images } from './Images';

const Tags = dbClient.define(
    'Tags',
    {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(50),
            unique: true
        },
        translatedName: DataTypes.STRING(50),
        customName: DataTypes.STRING(50),
        // 偏好等级
        likeLevel: {
            type: DataTypes.TINYINT,
            defaultValue: 0
        }
    },
    {
        tableName: 'imgTags',
        timestamps: false
    }
);

const ImagesTags = dbClient.define(
    'ImagesTags',
    {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            primaryKey: true,
            autoIncrement: true
        }
    },
    {
        tableName: 'ImagesTags',
        timestamps: false
    }
);

Images.belongsToMany(Tags, { through: ImagesTags, as: 'tags' });
Tags.belongsToMany(Images, { through: ImagesTags, as: 'images' });
