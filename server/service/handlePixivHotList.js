
const MainUrlStr = 'https://www.pixiv.net/ranking.php?format=json&${type}&p=${page}&date=${date}';
class handlePixivHotlist {
    constructor(
        {
            getType = null, //获取的类型（不能为null）
            getDate = null, //指定的时间(不能为null)
            startPage = 1,  //开始读取的页数
            endPage = 1,   //结束读取的页数
        }
    ) {
        //调用前注意参数的处理
        this.COMMON = {
            getType: getType,
            getDate: getDate,
            startPage: startPage,
            endPage: endPage
        }
    }
    //不使用缓存的主过程
    async queryStartNoCash() {

        let resultArr = [];
        let useCash = false;

        let COMMON = this.COMMON;
			
        let BaseUrl = MainUrlStr.replace('${type}', COMMON.getType).replace('${date}', COMMON.getDate.replace(/-/g, ''));
        for (let i = COMMON.startPage; i <= COMMON.endPage; i++) {
            var queryUrl = BaseUrl.replace('${page}', i);
            var queryResult = await this.originQuery(queryUrl, useCash);
            resultArr = resultArr.concat(queryResult.data.contents);
        }
        //TODO 错误处理，及错误抛出
        //正常结束
        return resultArr;

    }
    async queryStartWithCash() {

        let resultArr = [];
        let useCash = true;
        let COMMON = this.COMMON;

        let mainKey = COMMON.getType.replace('mode=', '');
        let timeKey = COMMON.getDate.replace(/-/g, '') + '_p';

        let BaseUrl = MainUrlStr.replace('${type}', COMMON.getType).replace('${date}', COMMON.getDate.replace(/-/g, ''));
        for (let i = COMMON.startPage; i <= COMMON.endPage; i++) {
            var queryUrl = BaseUrl.replace('${page}', i);
            var _cashResult = null;
            //读取缓存
            await redisCtl.HMGET({
                mainKey: mainKey,
                key: timeKey + i
            }).then((res) => {
                if (Object.prototype.toString.call(res) === "[object Array]") {
                    var cashData = res[0];
                    //缓存的数据
                    if (cashData) {
                        _cashResult = JSON.parse(cashData).contents;
                    }

                }
            });
            if (_cashResult === null) {
                var queryResult = await this.originQuery(queryUrl, useCash);
                _cashResult = await this.saveQueryResult(queryResult);
            }
           resultArr = resultArr.concat(_cashResult);
        }
        //TODO 错误处理，及错误抛出
        //正常结束
        return resultArr;

    }
    async originQuery(url, useCash) {
        let fakeCtx = {
            request: {
                body: {
                    Url: StringTool.strToHexCharCode(url)
                }
            }
        }
        let _promise = getPixivData.contrl(fakeCtx);
        let result = null;

        _promise.catch((err) => {
            myErrHandle('break', err)
        })

        function myErrHandle(msg, err) {
            console.log(msg, err)
            result = {
                status: 'error'
            }
        }
        await _promise.then((res) => {
            if (!res) {
                myErrHandle('缓存不存在且读取出错,res is null', res)
                return
            }
            if (typeof res.error === "undefined") {

                result = handleData(res);
                //数据处理
                async function handleData(inData) {
                    if (typeof inData === 'string') {
                        var inData = JSON.parse(inData);
                    }
                    // var handleList = [{
                    //     teype:'nomal',
                    //     method:changeData
                    // },{
                    //     type:'async',
                    //     method:downControl
                    // }];
                    var handleList = [{
                        teype: 'nomarl',
                        method: changeData
                    }];
                    if (useCash) {
                        handleList.push({
                            type: 'nomarl',
                            method: makeDownList
                        })
                    }

                    let outData = {};
                    outData.key = inData.date + '_p' + inData.page;

                    //主哈希
                    outData.mainHash = inData.mode;
                    outData.data = {};

                    let needList = ['illust_id', 'title', 'originUrl', 'url', 'illust_page_count', 'rank', 'tags'];

                    let needItemList = [];


                    for (let i = 0; i < inData.contents.length; i++) {

                        let item = inData.contents[i];
                        let cashItem = {};
                        for (let k = 0; k < handleList.length; k++) {
                            var method = handleList[k].method;
                            if (handleList[k].type === 'async') {
                                await method(item, cashItem)
                            } else {
                                cashItem = method(item, cashItem)
                            }
                        }

                        needItemList.push(cashItem);
                    }
                    outData.data.contents = needItemList;

                    function changeData(item, cashItem) {
                        for (let j = 0; j < needList.length; j++) {
                            cashItem[needList[j]] = item[needList[j]];
                        }
                        return cashItem
                    }
                    //同步下载
                    function downControl(item, cashItem) {
                        return downloadImg(cashItem['originUrl'], 'client/cash').then((res) => {
                            cashItem['originUrl'] = cashItem['url'];
                            cashItem['url'] = '/cash' + res.fileName;
                        });
                    }
                    //制作下载列表,同步多线程下载
                    function makeDownList(item, cashItem) {
                        if (outData.cashDownList) {
                            outData.cashDownList.push(cashItem['originUrl'])
                        } else {
                            outData.cashDownList = []
                            outData.cashDownList.push(cashItem['originUrl'])
                        }

                        return cashItem
                    }
                    return outData;
                }
            } else {
                myErrHandle('缓存不存在且读取出错,res.error', res)

            }

        });
        return result
    }
    async saveQueryResult(queryResult) {
        //缓存逻辑
        console.time('downImgList');
        var path = 'client/cash';
        var downList = queryResult.cashDownList
        var downObj = new downloadThread({
            path: path
        })
        downObj.downList(downList);
        var fileNameMap = {};
        await downObj.overControl().then((downRes) => {
            var getIdReg = /\/([0-9]{8,})_/
            downRes.map((item, index) => {
                var id = getIdReg.exec(item.fileName)[1];
                fileNameMap[id] = item.fileName
            })
        });
        queryResult.data.contents = queryResult.data.contents.map((item, index) => {
            var id = item.illust_id;
            if (fileNameMap[id]) {
                item['originUrl'] = item['url'];
                item['url'] = '/cash' + fileNameMap[id];
            }

            return item
        });

		var cashSetItem = JSON.stringify(queryResult);
        await redisCtl.HMSET(JSON.parse(cashSetItem));
        console.timeEnd('downImgList');
        return queryResult.data.contents;
    }
}

module.exports = handlePixivHotlist;