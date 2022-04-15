/**
 *  http 响应时的容器
 *  @param{number} retCode
 *  100 默认返回值
 *  200 成功
 */
export class resultBean {
    code: number;
    contents: any;
    text: string;
    constructor({
        code = 100,
        text = '连接成功',
        contents = {}
    }: {
        code: number;
        text: string;
        contents?: any;
    }) {
        this.code = code;
        this.contents = contents;
        this.text = text;
    }
}

/**
 *  数据库操作 响应时的容器
 *  @param{string} retState
 *  0 默认值
 *  1 请求成功
 * -1 请求失败
 *  @param{any} result
 *  通常为执行结果
 *  @param{any} errMsg
 *  失败时为 错误信息
 */
export class queryBean {
    retState: number;
    result: any;
    errMsg: any;
    constructor() {
        this.retState = 0;
        this.result = [];
        this.errMsg = null;
    }
}
