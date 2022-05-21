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

Ranking.belongsToMany(Images, { through: RankingImages });
