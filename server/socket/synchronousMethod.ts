import * as fs from 'fs';
import * as socketStream from 'socket.io-stream';
import {pathConfig } from '../../config/index';
import * as crypto from 'crypto';
import * as Stream from 'stream';
const downPath = pathConfig.downloadPath
const methodMap = {
    init:({
        clientSocket,
    })=>{
        let fileList = fs.readdirSync(downPath, {
            encoding: 'utf8'
        });
        
        clientSocket.local.emit('synchronous-fileState',{
            contents:{
                rows:fileList
            }
        });
        
    },
    getFile:({
        clientSocket={},   
        data={
            list:[]
        }
    })=>{
        let oneStep = setGetFile({
            clientSocket,
            list:data.list,
        });
        oneStep();
        methodMap.oneStep = oneStep;
    },
    overGetFile:({
        clientSocket={},   
        data={
            fileName:'',
            del:false,
        }
    })=>{
        if(data.del===true){
            let filePath = downPath+'/'+data.fileName
           fs.unlink(filePath,(err)=>{
            if(err){
                console.log('del:',data.fileName,'err');
            }
           }); 
        }
        methodMap.oneStep();
        
    },
    oneStep:()=>{
        return false;
    }

}
function setGetFile({
    clientSocket,
    list,
}){
    let oneStep = ()=>{
        let fileName = list.shift();
        if(!fileName){
          console.log('list over');
         clientSocket.local.emit('synchronous-listOver',{});
            return false
        }
        console.log('put file:',fileName);
        let filePath = downPath+'/'+fileName
        let fileBuffer = fs.readFileSync(filePath);
        let md5 = crypto.createHash('md5').update(fileBuffer).digest('hex');
        let putStream = socketStream.createStream();
        let bufferStream = new Stream.PassThrough();
        bufferStream.end(fileBuffer);
        socketStream(clientSocket).emit('synchronous-filePutInStorage',putStream,{
            fileName,
            md5,
        });

        bufferStream.pipe(putStream); 
        return true
    }
      
    return oneStep
}
module.exports = methodMap