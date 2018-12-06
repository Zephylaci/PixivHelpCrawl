const fs = require('fs');
const socketStream = require('socket.io-stream');
const downPath = require('../../config/index.js')['pathConfig']['downloadPath'];
const crypto = require('crypto');
const Stream = require('stream');

const methodMap = {
    init:({
        clientSocket={},
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
        }
    })=>{
        
        //fileName 后处理 比如 删除
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