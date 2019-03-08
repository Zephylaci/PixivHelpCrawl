import { handlePixivHotListClass } from "../handlePixivHotList";
import { loggerShow } from "../../utils/logger";



var tryGet = 1;
var wait = 5000;

function childFun(getConfig) {
	let mainQuery = new handlePixivHotListClass(getConfig);
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
	loggerShow.info('cashChild：进入重试流程，等待时间，', wait / 1000, 's');
	if (tryGet < 5) {
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
    loggerShow.info('autoCash process:disconnect!')
})