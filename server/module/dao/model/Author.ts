import { DataTypes } from 'sequelize';
import { dbClient } from '../sqlite';
import { Images } from './Images';

const Author = dbClient.define(
    'Author',
    {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(50)
        },
        account: {
            type: DataTypes.STRING(50)
        },
        // 偏好等级
        likeLevel: {
            type: DataTypes.TINYINT,
            defaultValue: 0
        },
        // 关联的图片数量
        // 每次子查询查的太慢了，缓存一下
        imageCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        profileImageUrl: DataTypes.STRING
    },
    {
        tableName: 'Author',
        createdAt: 'createTime',
        updatedAt: 'updateTime'
    }
);

Author.hasMany(Images, {
    foreignKey: 'authorId'
});
Images.belongsTo(Author, {
    as: 'author',
    foreignKey: 'authorId'
});
