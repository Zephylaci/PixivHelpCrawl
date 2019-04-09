import * as fs from 'fs';
import * as socketStream from 'socket.io-stream';
import { pathConfig } from '../../config/index';
import * as crypto from 'crypto';
import * as Stream from 'stream';
import { delImgDetail } from '../model/PixivImgStorageOperation';
import { loggerErr } from '../utils/logger';
import { getPixivOriginalDownState } from '../service/getPixivImgOriginal';
const downPath = pathConfig.downloadPath
export const methodMap = {
    init: ({
        clientSocket,
    }) => {
        //TODO: 如果下载正在进行，则挂起，且只挂起一个
        if(getPixivOriginalDownState()===false){
            let fileList = fs.readdirSync(downPath, {
                encoding: 'utf8'
            });
    
            clientSocket.local.emit('synchronous-fileState', {
                contents: {
                    rows: fileList
                }
            });
        }else{
            clientSocket.local.emit('synchronous-fileState', {
                contents: {
                    rows: []
                }
            });
        }
    },
    getFile: ({
        clientSocket = {},
        data = {
            list: []
        }
    }) => {
        let oneStep = setGetFile({
            clientSocket,
            list: data.list,
        });
        oneStep();
        methodMap.oneStep = oneStep;
    },
    overGetFile: ({
        clientSocket = {},
        data = {
            fileName: '',
            del: false,
        }
    }) => {
        if (data.del === true) {
            let filePath = downPath + '/' + data.fileName
            fs.unlink(filePath, (err) => {
                if (err) {
                    loggerErr.error(`del: ${data.fileName} ${err}`);
                }
            });
             delImgDetail({
                imgName:data.fileName
            }).catch((err)=>{
                loggerErr.error(`del sql:${data.fileName} ${err}`);
            })
        }
        methodMap.oneStep();

    },
    oneStep: () => {
        return false;
    }

}
function setGetFile({
    clientSocket,
    list,
}) {
    let oneStep = () => {
        let fileName = list.shift();
        if (!fileName) {
            console.log('list over');
            clientSocket.local.emit('synchronous-listOver', {});
            return false
        }
        console.log('put file:', fileName);
        let filePath = downPath + '/' + fileName
        let fileBuffer = fs.readFileSync(filePath);
        let md5 = crypto.createHash('md5').update(fileBuffer).digest('hex');
        let putStream = socketStream.createStream();
        let bufferStream = new Stream.PassThrough();
        bufferStream.end(fileBuffer);
        socketStream(clientSocket).emit('synchronous-filePutInStorage', putStream, {
            fileName,
            md5,
        });

        bufferStream.pipe(putStream);
        return true
    }
    return oneStep
}
export default methodMap