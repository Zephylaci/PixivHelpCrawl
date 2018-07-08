/**
*  获得榜单信息
*  功能：根据前端数据返回榜单数据
*  未完成      
**/

const getPixivData = require('./getPixivData.js');
const downloadImg = require('./downloadImg.js');

const events = require('events');
const StringTool = require('./../../tool/main.js')['StringTool'];

const MainStr = 'https://www.pixiv.net/ranking.php?format=json&${type}&p=${page}&date=${date}';
//缓存设置
const redisConfig = require('../../config/index.js')['redisConfig'];
const redisCtl = require('../dataBaseControl/redisControl.js');
//url解析
const parseUrl = require('url');
const querystring = require('querystring');


//var emitter = new events.EventEmitter();
var mainObj = {
	contrl: async (ctx, next) => {
		ctx.body = {
			code: 200,
			contents: '为啥没有返回值..'
		}
		//如果是autoCash调用
		var getList = [];
		var resultArr = [];
		if (ctx.myGetType) {
			var useCash = true
			var upTime = ctx.upTime;
			redisCtl.myOneSetpAllOver =true// 是否重试的开关
			getList.push(ctx.url)

		} else {
			let upData = ctx.request.body;
			var upUseCash = upData.useCash;
			var upTime = upData.date;

			var startPage = upData.startPage
			var endPage = upData.endPage;

			if (endPage < startPage) {
				ctx.body.contents = '参数错误';
				return
			}

			var mainUrl = MainStr.replace('${type}', upData.type).replace('${date}', upTime.replace(/-/g, ''));
			for (var i = startPage; i <= endPage; i++) {
				var cashUrl = mainUrl.replace('${page}', i);
				getList.push(cashUrl)
			}
			var useCash = redisConfig.useCash && upUseCash ? true : false;
		}

		var length = getList.length;
		for (var i = 0; i < length; i++) {
			await queryHotList(getList[i]).then((result) => {
				resultArr = resultArr.concat(result.contents)
			}).catch((err) => {
				length = 0;
			});
		}

		ctx.body.contents = resultArr;
		if (resultArr.length === 0) {
			ctx.body.contents = '缓存不存在且读取出错';
		}
		//autoCash需要拿到这个对象来方便结束
		if(ctx.myGetType){
			return redisCtl
		}
		function queryHotList(queryUrl) {
			var endStep = null;
			var errorStep = null;
			var promise = new Promise((resolve, reject) => {
				endStep = resolve;
				errorStep = reject;

			});

			if (useCash) {
				let urlObj = parseUrl.parse(queryUrl);
				let queryObj = querystring.parse(urlObj.query);
				let type = queryObj.mode;
				let page = queryObj.p;
				let timeKey = upTime.replace(/-/g, '') + '_p' + page;

				//读取缓存
				redisCtl.deal({
					type: 'HMGET',
					contents: {
						mainKey: type,
						key: timeKey
					}
				}).then((res) => {
					if (Object.prototype.toString.call(res) === "[object Array]") {
						var cashData = res[0];
						//缓存的数据
						if (cashData) {
							endStep(JSON.parse(cashData))
							return
						}

					}
					originQuery(queryUrl)

				})
			} else {
				originQuery(queryUrl)
			}
			function originQuery(url) {
				var fakeCtx = {
					request: {
						body: {
							Url: StringTool.strToHexCharCode(url)
						}
					}
				}
				var _promise = getPixivData.contrl(fakeCtx)
				_promise.then(async (res) => {
					if (!res) {
						myErrHandle('缓存不存在且读取出错,res is null',res)

						return
					}
					if (typeof res.error === "undefined") {
						//缓存逻辑
						console.time('downImgList');
						let setItem = await handleData(res);
						if (setItem.cashDownList) {
							const downloadThread = require('./downloadThread.js');
							var path = 'client/cash';
							var downList = setItem.cashDownList
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
							setItem.data.contents = setItem.data.contents.map((item, index) => {
								var id = item.illust_id;
								if (fileNameMap[id]) {
									item['originUrl'] = item['url'];
									item['url'] = '/cash' + fileNameMap[id];
								}

								return item
							})
						}
						console.timeEnd('downImgList');
						//拷贝刚处理完成的函数 避免被缓存操作改变数据结构
						var needData = JSON.stringify(setItem.data);
						//缓存 榜单的信息
						if (useCash) {
							await redisCtl.deal({
								type: 'HMSET',
								contents: setItem
							});
						}


						endStep(JSON.parse(needData));
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
							if(useCash){
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
						myErrHandle('缓存不存在且读取出错,res.error',res)
						
					}

				})
				_promise.catch((err) => {
					myErrHandle('break',err)
				})

				function myErrHandle(msg,err){
					console.log(msg,err)
					if(ctx.myGetType){
						redisCtl.myOneSetpAllOver = false
					}
					errorStep('err')
				}
				
				return _promise
			}
			return promise;
		}

	}
}



module.exports = mainObj;