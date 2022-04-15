import { resultBean } from '../type/bean/resultBean';

export function generalResult(ctx) {
    if (ctx.request.method === 'POST') {
        ctx.body = new resultBean({
            code: 100,
            text: ''
        });
    }
}
export default generalResult;
