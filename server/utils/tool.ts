/****
 * 传入一个class劫持其new方法，生成一个单例类
 */

export const singleClassHelp = function <T>(needSingleClass: T): T {
    let instance;
    let handler = {
        construct(target, args) {
            if (!instance) {
                instance = new (<any>needSingleClass)(...args)
            }
            return instance
        }
    }
    return new Proxy(needSingleClass, handler)
}