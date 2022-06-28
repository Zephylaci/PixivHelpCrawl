import { getDbControl } from '../module/dao';
import { DataTypes } from 'sequelize';

(async () => {
    try {
        const control = await getDbControl();
        const queryInterface = await control.getQueryInterface();
        await queryInterface.addColumn('imgStorage', 'likeLevel', {
            type: DataTypes.TINYINT,
            defaultValue: 0
        });
        await queryInterface.addIndex('imgStorage', ['createTime']);
        await queryInterface.addIndex('imgStorage', ['sanityLevel']);
        await queryInterface.addIndex('imgStorage', ['totalBookmarks']);
        await queryInterface.addIndex('imgStorage', ['totalView']);
        await queryInterface.addIndex('imgStorage', ['likeLevel']);
    } catch (error) {
        console.log(error);
    }
})();
