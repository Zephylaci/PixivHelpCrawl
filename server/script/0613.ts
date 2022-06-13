import { getDbControl } from '../module/dao';
import { DataTypes } from 'sequelize';

(async () => {
    try {
        const control = await getDbControl();
        const queryInterface = await control.getQueryInterface();

        await queryInterface.addColumn('Author', 'imageCount', {
            type: DataTypes.TINYINT,
            defaultValue: 0
        });

        await queryInterface.addColumn('RankingRecord', 'imageCount', {
            type: DataTypes.TINYINT,
            defaultValue: 0
        });

        const Author = control.model('Author');
        const allList: Array<any> = await Author.findAll();
        for (let item of allList) {
            let count = await item.countImages();
            item.imageCount = count;
            await item.save();
        }

        const Ranking = control.model('Ranking');
        const allList2: Array<any> = await Ranking.findAll();
        for (let item of allList2) {
            let count = await item.countImages();
            item.imageCount = count;
            await item.save();
        }

        console.log(JSON.stringify(await Author.findOne(), null, 4));
        console.log(JSON.stringify(await Ranking.findOne(), null, 4));
    } catch (error) {
        console.log(error);
    }
})();
