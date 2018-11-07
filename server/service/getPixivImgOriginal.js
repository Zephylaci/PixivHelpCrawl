const getPixivData = require('./getPixivData.js');
const publicClass = require('./publicClass/concurrentHandle.js');
const getPixivImgOriginalClass = new publicClass();

async function handleUpitem(queryItem) {
    let imgId = queryItem.illust_id
    let queryUrl = `https://www.pixiv.net/member_illust.php?mode=medium&illust_id=${imgId}`;
    let getMonomers = new getPixivData.MonomersClass();
    let result = {
        imgId: imgId
    };
    await getMonomers.contrl(queryUrl).then((res) => {
        result.downUrl = res.urls.original;
    }).catch((err) => {
        console.log(err)
    });
    return result
}

getPixivImgOriginalClass.queryInit({
    queryName: 'getPixivImgOriginal',
    step: handleUpitem, //单次操作 通常是async函数，返回需要的结果值
})
let getPixivImgOriginal = {
    downList: function (queryList) {
        getPixivImgOriginalClass.queryStart(queryList);

        return getPixivImgOriginalClass.overControl();
    }
}
module.exports = getPixivImgOriginal
// function childFun(parames) {
//     let imgId = parames.imgId;

//     let queryUrl = `https://www.pixiv.net/member_illust.php?mode=medium&illust_id=${imgId}`;

//     getPixivData.contrl(queryUrl)
//         .then((res) => {
//             tryGet = 1;

//             parames.resultData = res;
//             let downUrl = res.urls.original;
//             if (downUrl) {
//                 downloadImg(downUrl).then((dres) => {
//                     parames.resultData.fileName = dres.fileName;
//                     parames.resultData.imgPath = dres.imgPath;
//                     process.send(parames);
//                 })
//             }

//         }).catch((err) => {
//             console.log('downChild：进入重试流程，等待时间，', wait / 1000, 's');
//             if (tryGet < 5) {
//                 console.log(parames, err);
//                 setTimeout(() => {
//                     childFun(parames)
//                 }, wait)
//                 tryGet++
//                 wait += wait;
//             } else {
//                 tryGet = 1;

//                 parames.downState = 'faill';
//                 process.send(parames);
//             }

//         });
// }