let socketClient = require('socket.io-client');

const  address = `127.0.0.1:8082/`;

test('doSearchWebSocket', () => {
    let testProcess = new Promise(async (resolve,reject)=>{
        let mockUpData = {
            strKey:"碧蓝",
            isSafe:true,
            cashPreview:true,
            startPage:1,
            endPage:1,
            bookmarkCountLimit:50,
        } 
        let socket = socketClient('http://'+address);
        expect.assertions(7);
        socket.once('doSearch-addList',function(res){
            let resData = res.contents;
            expect(typeof resData.length).toBe('number');
        });
        socket.emit('doSearch',{method:'init'});
        //step1
        socket.once('doSearch-changeState',function(res){
            let resData = res.contents;
            let item = resData.state;
            expect(item.strKey).toBe('碧蓝');
            expect(typeof item.state).toBe('string');
            expect(typeof item.count).toBe('number');
            if(item.state === 'cashPreview'){
                let judge = item.count<=40;
                expect(judge).toBe(true);
                socket.once('doSearch-changeState',step3);
            }else{
                socket.once('doSearch-changeState',step2);
            }
            
        });
        function step2(res){
            let resData = res.contents;
            let item = resData.state;
            let judge = item.count<=40;
            expect(judge).toBe(true);
            socket.once('doSearch-changeState',step3);
        }
        function step3(res){
            let resData = res.contents;
            let item = resData.state;
            expect(item.state).toBe('over');
            expect(item.isCashOver).toBe('over');
            socket.disconnect();
            resolve();
        }
        socket.emit('doSearch',{method:'makeSeachPlan',data:mockUpData});  
    })
    return testProcess
},400000);