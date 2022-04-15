import * as Path from 'path';
import { Sequelize } from 'sequelize';
import { DataTypes } from 'sequelize';

const client = new Sequelize({
    dialect: 'sqlite',
    storage: Path.resolve(__dirname, '../../db/development.db')
});

const Images = client.define(
    'Images',
    {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            primaryKey: true,
            autoIncrement: true
        },
        name: DataTypes.STRING(50),
        imgPath: DataTypes.STRING
    },
    {
        tableName: 'imgStorage',
        createdAt: 'createTime',
        updatedAt: 'updateTime'
    }
);

const Tags = client.define(
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
        }
    },
    {
        tableName: 'imgTags',
        timestamps: false
    }
);

const ImagesTags = client.define(
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

Images.belongsToMany(Tags, { through: ImagesTags });
Tags.belongsToMany(Images, { through: ImagesTags });

const Author = client.define(
    'Author',
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
        }
    },
    {
        tableName: 'Author',
        createdAt: 'createTime',
        updatedAt: 'updateTime'
    }
);

Author.hasMany(Images);
Images.belongsTo(Author);

const Ranking = client.define(
    'Ranking',
    {
        id: {
            type: DataTypes.INTEGER,
            unique: true,
            primaryKey: true,
            autoIncrement: true
        },
        date: DataTypes.STRING(50),
        mode: DataTypes.STRING(50)
    },
    {
        tableName: 'RankingRecord',
        createdAt: 'createTime',
        updatedAt: 'updateTime'
    }
);

Ranking.belongsToMany(Images, { through: 'RankingImages' });

(async () => {
    await client.sync({ force: true });

    const [tag1]: any = await Tags.findOrCreate({
        where: {
            name: 'tag1'
        },
        defaults: {
            name: 'tag1'
        }
    });
    const [tag2]: any = await Tags.findOrCreate({
        where: {
            name: 'tag2'
        },
        defaults: {
            name: 'tag2'
        }
    });

    const [author1]: any = await Author.findOrCreate({
        where: {
            name: 'author1'
        },
        defaults: {
            name: 'author1'
        }
    });

    const some1: any = await Images.create({
        name: 'some'
    });

    const some2: any = await Images.create({
        name: 'some2'
    });

    const some3: any = await Images.create({
        name: 'some3'
    });
    await some1.setTags([tag1, tag2]);
    await some2.addTags([tag1]);
    await some1.setAuthor(author1);
    await some3.setAuthor(author1);

    const ranking: any = await Ranking.create({
        date: '2020-01-01',
        mode: 'daily'
    });

    await ranking.setImages([some1, some2, some3]);

    const list = await Ranking.findOne({
        where: {
            date: '2020-01-01',
            mode: 'daily'
        },
        include: [Images]
    });

    console.log('check:', JSON.stringify(list, null, 4));
})();
