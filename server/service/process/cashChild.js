const getPixivHotList = require('../../api/PixivCrawler/getPixivHotList.js');
var activeEndRedis = null
var tryGet = 1;
var wait = 5000;

function childFun(parames) {
    var fakeCtx={
        myGetType:'autoCash',
        url:parames.url,
		upTime:getYesterday()
    }
	function getYesterday(){

		var now = new Date();
		var year = now.getFullYear();
		var Month = addZero(now.getMonth()+1)
		var day= addZero(now.getDate()-1);
		function addZero(num){
			var num = num.toString()
			if(num.length===1){
				num = '0'+num
			}
			return num
		}
		return year+'-'+Month+'-'+day

	}
    getPixivHotList.contrl(fakeCtx)
        .then((redisObj) => {
			tryGet = 1;
			if(redisObj.myOneSetpAllOver===false){
				myCatch(err,parames);
			}else{
				activeEndRedis=redisObj.end
				process.send(fakeCtx);
			}

        }).catch((err) => {
			myCatch(err,parames);

        });
}
function myCatch(err,parames){
	console.log('cashChild：进入重试流程，等待时间，', wait / 1000, 's');
	if (tryGet < 5) {
		console.log(parames);
		setTimeout(() => {
			childFun(parames)
		}, wait)
		tryGet++
		wait += wait;
	} else {
		tryGet = 1;
		parames.downState = 'faill';
		process.send(parames);
	}
}
process.on('message', (opt) => {
    childFun(opt);
});

process.on('close', () => {
    // endRedis();
    // endRedis = function () { };
    console.log('autoCash process close!')

});

process.on('disconnect', () => {
	if(typeof activeEndRedis==='function'){
		activeEndRedis();
	}
	activeEndRedis = null
    console.log('autoCash process disconnect!')


})