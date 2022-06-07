import { PixivIllust } from '../module/pixiv-api/PixivTypes';

export interface IllustsItem extends PixivIllust {
    [x: string]: any;
}
export interface DbIllustsItem {
    id: number;
    title: string;
    previewUrl: string;
    totalBookmarks: number;
    totalView: number;
    tags: Array<any>;
    author: any;
    count: number;
    originUrlJson: string;
}
export interface ResIllustsItem {
    id: number;
    title: string;
    previewUrl: string;
    totalBookmarks: number;
    totalView: number;
    tags: Array<any>;
    author: any;
    count: number;
    metaPages?: Array<string>;
    detailUrls?: Array<string>;
    originUrls?: Array<string>;
}

export const pixivMode = [
    'day',
    'week',
    'month',
    'day_male',
    'day_female',
    'week_original',
    'week_rookie',
    'day_r18',
    'day_male_r18',
    'day_female_r18',
    'week_r18',
    'week_r18g',
    'day_manga',
    'week_manga',
    'month_manga',
    'week_rookie_manga',
    'day_r18_manga',
    'week_r18_manga',
    'week_r18g_manga'
];
