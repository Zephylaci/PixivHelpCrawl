import getPixivData from '../../service/getPixivData';
import { loggerErr, loggerShow, logger } from "../../utils/logger";
import { concurrentHandleClass } from ".././class/concurrentHandle";
import { downloadImg } from ".././downloadImg";
import { insertImgOptType } from '../../type';
import { insertImgStorage, getImgDetail, delImgDetail } from '../../model/PixivImgStorageOperation';
import { pathConfig } from '../../../config';
import { queryBean } from '../../type/bean/resultBean';
import { resolve } from 'path';
import { existsSync } from 'fs';
import axios from 'axios';
const getPixivImgOriginalClass = new concurrentHandleClass({
    queryName: 'getPixivImgOriginal',
    step: handleUpitem, //单次操作 通常是async函数，返回需要的结果值
});


interface pixivImgResInter {
    imgId: number;
    state: string;
    downUrl?: string;
    fileName?: string;
    imgPath?: string;
}

function getNeedData(insertOpt, getRes) {
    let { illustId, illustTitle, tags } = getRes;
    insertOpt.imgId = illustId;
    insertOpt.imgTitle = illustTitle;
    insertOpt.imgTags = JSON.stringify(tags);
    return insertOpt
}
async function imgIsExist(imgId: string) {
    let isExist = false;
    //本地数据库及文件查找;
    await getImgDetail({
        getImgOpt: {
            imgId
        },
        getValue: ['imgName']
    }).then(async (queryRes: queryBean) => {
        if (queryRes.retState === 1) {
            let imgName = queryRes.result.imgName
            if (imgName && existsSync(resolve(pathConfig.downloadPath, imgName))) {
                isExist = true;
            } else {
                //不存在文件而存在数据库信息则删除本地库中的内容
                await delImgDetail({
                    imgId
                })
            }
        }
    });
    if (isExist === false) {
        //FIXME: 配置文件中配置远端地址，存在则请求
        await axios.post('http://192.168.10.105:8082/api/judgePixivImgExist', {
            imgId
        })
            .then(function (response) {
                let resData = response.data
                if (resData.code == 200) {
                    isExist = resData.contents.existState;
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    return isExist;
}
async function handleUpitem(queryItem: number) {
    let imgId = queryItem;
    let result: pixivImgResInter = {
        imgId: imgId,
        state: 'init'
    };

    if (await imgIsExist(String(imgId))) {
        result.state = 'isExist';
        return result
    }
    let queryUrl = `https://www.pixiv.net/member_illust.php?mode=medium&illust_id=${imgId}`;
    let getMonomers = new getPixivData.MonomersClass();

    let insertOpt: insertImgOptType = {
        imgId: null,
        imgName: null,
        imgTitle: null,
        imgTags: null
    }
    //获得下载地址,可以省略请求换成按一定规则请求的类型
    await getMonomers.contrl(queryUrl)
        .then((res) => {
            if (res) {
                //此处也能拿到别的信息，可以扩展
                result.downUrl = res.urls.original;
                insertOpt = getNeedData(insertOpt, res)
                result.state = 'queryOver';
            } else {
                result.state = 'queryErr';
            }
        }).catch((err) => {
            loggerErr.warn(`getPixivImg query Error:${err}`);
            result.state = 'queryErr';
        });

    if (result.state === 'queryErr') {
        return result;
    }

    //下载
    await downloadImg(result.downUrl)
        .then((downRes: any) => {
            result.state = downRes.state;
            result.fileName = downRes.fileName;
            result.imgPath = downRes.imgPath;
        });

    //写入数据库
    if (result.state != 'downErr') {
        let { fileName } = result;
        insertOpt.imgName = fileName.replace('\/', '');
        await insertImgStorage(insertOpt)
            .then(insertRes => {
                result.state = 'insertOver'
            })
            .catch(err => {
                result.state = 'insertErr'
                loggerErr.error(err);
            });
    }

    return result
}


process.on('message', (queryList) => {
    getPixivImgOriginalClass.queryStart(queryList).overControl({
        success: (res) => {
            process.send(res);
        },
        error: (err) => {
            loggerErr.error(err);
            process.send(queryList);
        }
    });
})

process.on('disconnect', () => {
    loggerShow.info('getPixivProcess: 开始关闭');
});