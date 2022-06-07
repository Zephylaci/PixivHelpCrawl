import got from 'got';
import httpsProxyAgent from 'https-proxy-agent';
import { pixivConfig, linkProxy } from '../../config';
import { IllustsItem, DbIllustsItem, ResIllustsItem } from '../type/index';
import { loggerErr } from './logger';

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

export function transPreviewUrl(url: string | undefined, needCash = true) {
    const target = needCash ? '/api/pixiv/proxy-save' : '/api/pixiv/proxy';
    if (typeof url === 'string') {
        return url.replace('https://i.pximg.net', target);
    } else {
        loggerErr.trace('transPreviewUrl warning url', url);
    }
    return url;
}

export function transDbResult<T>(res: T): T {
    return JSON.parse(JSON.stringify(res));
}

export function tansIllustsItem({
    originUrlJson,
    id,
    title,
    previewUrl,
    totalBookmarks,
    totalView,
    tags,
    author
}: DbIllustsItem): ResIllustsItem {
    const origin: any = JSON.parse(originUrlJson);
    const item: ResIllustsItem = {
        id,
        title,
        previewUrl,
        totalBookmarks,
        totalView,
        tags,
        author,
        count: origin.pageCount
    };
    if (origin.pageCount > 1) {
        item.detailUrls = [];
        item.originUrls = [];

        item.metaPages = origin.metaPages.map(({ imageUrls }) => {
            const { squareMedium, medium, large, origin } = imageUrls;
            const previewUel = medium || squareMedium || large;
            const detailUrl = large || medium || squareMedium;

            item.detailUrls = [transPreviewUrl(detailUrl)];
            item.originUrls = [transPreviewUrl(origin, false)];
            return transPreviewUrl(previewUel);
        });
    } else {
        const { large, medium, squareMedium } = origin.imageUrls;
        const detailUrl = large || medium || squareMedium;

        item.detailUrls = [transPreviewUrl(detailUrl)];
        item.originUrls = [transPreviewUrl(origin.originalImageUrl, false)];
    }
    return item;
}

export function parseImgItem(item: IllustsItem) {
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
    const { squareMedium, medium, large } = imageUrls;
    const previewUrl = transPreviewUrl(medium || squareMedium || large);
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
            profileImageUrl: transPreviewUrl(profileImageUrls.medium, false)
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
