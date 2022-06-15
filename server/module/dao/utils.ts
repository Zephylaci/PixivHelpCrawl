import { Op } from 'sequelize/types';
import { getDbControl } from './index';

export async function makeImageParamsFromRule({ queryParams = {}, rule }: any) {
    const ctx = await getDbControl();
    const Tags = ctx.model('Tags');
    const Author = ctx.model('Author');

    let result = queryParams;
    if (rule.imageAttr) {
        result = {
            ...queryParams,
            ...rule.imageAttr
        };
    }
    if (rule.tagAttr || rule.authorAttr) {
        result.include = [];
        if (rule.tagAttr) {
            result.include.push({
                model: Tags,
                through: { attributes: [] },
                as: 'tags',
                ...rule.tagAttr
            });
        }
        if (rule.authorAttr) {
            result.include.push({
                model: Author,
                as: 'author',
                ...rule.authorAttr
            });
        }
    }

    return result;
}
