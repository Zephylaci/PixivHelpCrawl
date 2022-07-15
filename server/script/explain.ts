import { getDbControl } from '../module/dao/index';
import { saveIllust } from '../service/handlePixiv';
import { parseImgItem } from '../utils/gotPixivImg';
import { saveImageInfo, getImageInfo } from '../module/dao/interface/Images';
import { getTagList } from '../module/dao/interface/Tags';
import { saveRanking, getRankingInfo, getRanking } from '../module/dao/interface/Ranking';
import { Sequelize, Op } from 'sequelize';
import { DataTypes } from 'sequelize';

(async () => {
    const control = await getDbControl();
    // const queryInterface = await control.getQueryInterface();

    const Tags = control.model('Tags');
    const Author = control.model('Author');
    const Images = control.model('Images');
    const ImagesTags = control.model('ImagesTags');
    const Ranking = control.model('Ranking');
    const RankingImages = control.model('RankingImages');

    const res = await control.query(
        'EXPLAIN QUERY PLAN SELECT `Images`.*, `tags`.`id` AS `tags.id`, `tags`.`name` AS `tags.name`, `tags`.`translatedName` AS `tags.translatedName`, `tags`.`customName` AS `tags.customName`, `tags`.`likeLevel` AS `tags.likeLevel`, `author`.`id` AS `author.id`, `author`.`name` AS `author.name`, `author`.`profileImageUrl` AS `author.profileImageUrl` FROM (SELECT `Images`.`id`, `Images`.`title`, `Images`.`previewUrl`, `Images`.`totalBookmarks`, `Images`.`totalView`, `Images`.`originUrlJson`, `Images`.`sanityLevel`, `Images`.`likeLevel`, `Images`.`createTime`, `Images`.`authorId` FROM `imgStorage` AS `Images` WHERE `Images`.`sanityLevel` < 5 AND ( SELECT `ImagesTags`.`id` FROM `ImagesTags` AS `ImagesTags` INNER JOIN `imgTags` AS `Tag` ON `ImagesTags`.`TagId` = `Tag`.`id` WHERE (`Images`.`id` = `ImagesTags`.`ImageId` AND (`ImagesTags`.`TagId` = 7813)) LIMIT 1 ) IS NOT NULL ORDER BY `Images`.`createTime` DESC LIMIT 0, 15) AS `Images` INNER JOIN ( `ImagesTags` AS `tags->ImagesTags` INNER JOIN `imgTags` AS `tags` ON `tags`.`id` = `tags->ImagesTags`.`TagId` AND (`tags->ImagesTags`.`TagId` = 7813)) ON `Images`.`id` = `tags->ImagesTags`.`ImageId` LEFT OUTER JOIN `Author` AS `author` ON `Images`.`authorId` = `author`.`id` ORDER BY `Images`.`createTime` DESC;'
    );

    console.log(JSON.stringify(res, null, 4));
})();
