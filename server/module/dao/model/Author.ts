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
