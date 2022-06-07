/****
 * 传入一个class劫持其new方法，生成一个单例类
 */

export const singleClassHelp = function <T>(needSingleClass: T): T {
    let instance;
    let handler = {
        construct(target, args) {
            if (!instance) {
                instance = new (<any>needSingleClass)(...args);
            }
            return instance;
        }
    };
    return new Proxy(needSingleClass, handler);
};

export const formatDate = function (time, format = 'YYYY-MM-DD') {
    let date = new Date(time);
    var args = {
        'M+': date.getMonth() + 1,
        'D+': date.getDate(),
        'H+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'q+': Math.floor((date.getMonth() + 3) / 3), //quarter
        S: date.getMilliseconds()
    };
    if (/(Y+)/.test(format))
        format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    for (var i in args) {
        var n = args[i];
        if (new RegExp('(' + i + ')').test(format))
            format = format.replace(
                RegExp.$1,
                RegExp.$1.length == 1 ? n : ('00' + n).substr(('' + n).length)
            );
    }
    return format;
};

const sortKey = {
    ascend: 'ASC',
    descend: 'DESC'
};

export function parseSorter(sort: Array<{ field; order }>) {
    return sort
        .map(({ field, order }) => {
            if (field && order && sortKey[order]) {
                return [field, sortKey[order]];
            }
            return null;
        })
        .filter(item => item);
}
