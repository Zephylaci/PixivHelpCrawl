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
        date: DataTypes.STRING(50),
        mode: DataTypes.STRING(50),
        offset: DataTypes.SMALLINT
    },
    {
        tableName: 'RankingRecord',
        createdAt: 'createTime',
        updatedAt: 'updateTime'
    }
);

Ranking.belongsToMany(Images, { through: 'RankingImages' });
