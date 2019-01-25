import { resultBean } from "../utils/bean/resultBean";

export function generalResult (ctx){
    ctx.body = new resultBean({
        code:100,
        text:'连接成功'
    });
}
export default generalResult