import { getDbControl } from '../module/dao';
import { DataTypes } from 'sequelize';

(async () => {
    try {
        const control = await getDbControl();
        const queryInterface = await control.getQueryInterface();
        // await queryInterface.addIndex('imgStorage', ['authorId', 'id']);
        await queryInterface.addIndex('RankingImages', ['RankingId', 'ImageId']);

        // await queryInterface.addIndex('ImagesTags', ['TagId']);
        // await queryInterface.addIndex('ImagesTags', ['ImageId', 'TagId']);
        // await queryInterface.addIndex('ImagesTags', ['ImageId']);
        // await queryInterface.addIndex('imgStorage', ['id']);
        // await queryInterface.addIndex('imgTags', ['id']);

        // await queryInterface.removeIndex('ImagesTags', ['TagId', 'ImageId']);
        // await queryInterface.removeIndex('ImagesTags', ['TagId']);
        // await queryInterface.removeIndex('ImagesTags', ['ImageId', 'TagId']);
        // await queryInterface.removeIndex('ImagesTags', ['ImageId']);
        // await queryInterface.removeIndex('imgTags', ['id']);
    } catch (error) {
        console.log(error);
    }
})();
