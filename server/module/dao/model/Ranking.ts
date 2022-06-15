import { DataTypes } from 'sequelize';
import { dbClient } from '../sqlite';
import { Images } from './Images';

const Ranking = dbClient.define(
    'Ranking',
    {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            primaryKey: true,
            autoIncrement: true
        },
        date: {
            type: DataTypes.STRING(50),
            unique: 'index'
        },
        mode: {
            type: DataTypes.STRING(50),
            unique: 'index'
        },
        // 关联的图片数量
        // 列表中每次子查询查的太慢了，缓存一下
        imageCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        startOffset: DataTypes.SMALLINT
    },
    {
        tableName: 'RankingRecord',
        createdAt: 'createTime',
        updatedAt: 'updateTime'
    }
);

const RankingImages = dbClient.define(
    'RankingImages',
    {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            primaryKey: true,
            autoIncrement: true
        }
    },
    {
        tableName: 'RankingImages',
        timestamps: false
    }
);

Ranking.belongsToMany(Images, {
    through: RankingImages,
    sourceKey: 'id',
    targetKey: 'id',
    foreignKey: 'RankingId',
    otherKey: 'ImageId',
    uniqueKey: 'id'
});
RankingImages.hasOne(Images, { sourceKey: 'ImageId', foreignKey: 'id' });
