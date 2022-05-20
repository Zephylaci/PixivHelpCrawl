import { getImageInfo, saveImageInfo } from '../module/dao/interface/Images';
import { PixivIllust } from '../module/pixiv-api/PixivTypes';
import { parseImgItem } from '../utils/gotPixivImg';
import { loggerShow } from '../utils/logger';

export async function saveIllust(item: PixivIllust) {
    const id = item.id;
    const images = await getImageInfo(id, { imageAttr: { attributes: ['id'] } });
    if (!images) {
        try {
            await saveImageInfo(parseImgItem(item));
        } catch (error) {
            loggerShow.error('saveIllust:', error, JSON.stringify(item));
            return null;
        }
    }
    return id;
}
