import { handlePixivHotListClass } from "../handlePixivHotList";



var tryGet = 1;
var wait = 5000;
var mainQuery:any = {};
function childFun(getConfig) {
	mainQuery = new handlePixivHotListClass(getConfig);

    mainQuery.queryStartWithCash()
        .then(() => {
			tryGet = 1;
			process.send(getConfig);
        }).catch((err) => {
		    console.log(err);
			myCatch(err,getConfig);

        });
}
function myCatch(err,getConfig){
	console.log('cashChild：进入重试流程，等待时间，', wait / 1000, 's');
	if (tryGet < 5) {
		console.log(getConfig);
		setTimeout(() => {
			childFun(getConfig)
		}, wait)
		tryGet++
		wait += wait;
	} else {
		tryGet = 1;
		getConfig.downState = 'faill';
		process.send(getConfig);
	}
}
process.on('message', (opt) => {
    childFun(opt);
});

process.on('disconnect', () => {
    mainQuery.closeRedis();
    console.log('autoCash process disconnect!')
})