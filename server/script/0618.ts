import { getDbControl } from '../module/dao';
import { DataTypes } from 'sequelize';

(async () => {
    try {
        const control = await getDbControl();
        const queryInterface = await control.getQueryInterface();
        await queryInterface.addIndex('imgStorage', ['authorId', 'id']);
        await queryInterface.addIndex('ImagesTags', ['TagId', 'ImageId']);
    } catch (error) {
        console.log(error);
    }
})();
