import got from 'got';
import httpsProxyAgent from 'https-proxy-agent';
import { pixivConfig, linkProxy } from '../../config';
import { PixivIllust } from '../module/pixiv-api/PixivTypes';

const baseUrl = 'https://i.pximg.net/';
let agent = null;
if (linkProxy.useLinkProxy) {
    agent = {
        https: httpsProxyAgent(linkProxy.linkProxyAddr)
    };
}

export const gotImgInstance = got.extend({
    prefixUrl: baseUrl,
    headers: pixivConfig.headers,
    agent
});

interface illustsItem extends PixivIllust {
    [x: string]: any;
}

export function transPreviewUrl(url: string, needCash = true) {
    const target = needCash ? '/api/pixiv/proxy-save' : '/api/pixiv/proxy';
    return url.replace('https://i.pximg.net', '/api/pixiv/proxy-save');
}

export function transDbResult<T>(res: T): T {
    return JSON.parse(JSON.stringify(res));
}

export function parseImgItem(item: illustsItem) {
    const {
        id,
        title,
        sanityLevel,
        totalBookmarks,
        totalView,
        type,
        height,
        width,
        imageUrls,
        pageCount,
        tags,
        user
    } = item;

    const originUrl: any = { imageUrls, pageCount };
    const previewUrl = transPreviewUrl(imageUrls.medium);
    let author = undefined;

    if (pageCount !== 1) {
        const { metaPages } = item;
        originUrl.metaPages = metaPages;
    } else {
        const { metaSinglePage } = item;
        originUrl.originalImageUrl = metaSinglePage.originalImageUrl;
    }

    [id, title, previewUrl].map(value => {
        if (!value) {
            throw new Error(`parseImgItem error：${JSON.stringify(item)}`);
        }
    });
    if (user && user.id) {
        const { id, account, name, profileImageUrls } = user;
        author = {
            id,
            account,
            name,
            profileImageUrl: profileImageUrls.medium
        };
    }

    return {
        image: {
            id,
            title,
            previewUrl,
            originUrlJson: JSON.stringify(originUrl),
            sanityLevel,
            totalBookmarks,
            totalView,
            type,
            height,
            width
        },
        tags,
        author
    };
}
