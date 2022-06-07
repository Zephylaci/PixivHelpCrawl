import { getDbControl } from '../module/dao';
import { DataTypes } from 'sequelize';
import { transPreviewUrl } from '../utils/gotPixivImg';

(async () => {
    try {
        const control = await getDbControl();
        const queryInterface = await control.getQueryInterface();

        await queryInterface.addColumn('Author', 'likeLevel', {
            type: DataTypes.TINYINT,
            defaultValue: 0
        });

        const Author = control.model('Author');
        const allList: Array<any> = await Author.findAll();
        for (let item of allList) {
            item.profileImageUrl = transPreviewUrl(item.profileImageUrl, false);
            await item.save();
        }

        console.log(JSON.stringify(await Author.findOne(), null, 4));
    } catch (error) {
        console.log(error);
    }
})();
