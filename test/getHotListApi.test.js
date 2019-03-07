/**
 *  开始测试前需要先启动项目
 * 
 */

var axios = require('axios')


const address = `http://localhost:8082/api/` 

/**
 *  1、对获取每日热榜（getPixivHotList）的api测试
 *   1.不开启缓存读取前两天的日榜第三页
 *   2.开启缓存读取
 *   3.重复读取验证是否缓存
 *  如果返回的条数对不上50，先检查是否设置了过滤
 *  2、对下载图片（pixivDownloadControl）的api测试
 *    1.随机选择一张图片下载
 *    2.再添加随机的五张图片下载
 *    
 */
test('getPixivHotList', () => {
    let mockQuery = {
        type: 'mode=daily',
        date: getBeforeYesterday(),
        startPage: 4,
        endPage: 4,
    }
    let getPixivHotList = address+'getPixivHotList';
    let testProcess = new Promise(async (resolve,reject)=>{
        //至少会有14个断言 (每次请求两个)
        expect.assertions(16);
        // 不开启缓存读取
        let startTiem = new Date().getTime();

        await axios.post(getPixivHotList,mockQuery)
            .then((res)=>{
                let result = res.data;
                expect(result.code).toBe(200);
                expect(result.contents.length>0).toBe(true);
                let endTime = new Date().getTime();
                console.log(`getPixivHotList : 不开启缓存获取日榜完成,耗时：${startTiem-endTime} -ms`);
 
            })
        // 开启缓存读取
        startTiem = new Date().getTime();
        mockQuery.useCash = true
        await axios.post(getPixivHotList,mockQuery)
            .then((res)=>{
                let result = res.data;
                expect(result.code).toBe(200);
                expect(result.contents.length>0).toBe(true);
                let endTime = new Date().getTime();
                console.log(`getPixivHotList : 开启缓存获取日榜(第一次)完成,耗时：${startTiem-endTime} -ms`);

            })
        // 开启缓存读取(读取缓存)
        startTiem = new Date().getTime();
        let imgList = [];
        await axios.post(getPixivHotList,mockQuery)
            .then((res)=>{
                let result = res.data;
                expect(result.code).toBe(200);
                expect(result.contents.length>0).toBe(true);
                imgList = result.contents;
                let endTime = new Date().getTime();
                console.log(`getPixivHotList : 开启缓存获取日榜(第二次)完成,耗时：${startTiem-endTime} -ms`);
                
            })
        //测试下载功能
        console.log('pixivDownloadControl : 测试开始');
        startTiem = new Date().getTime();
        let  downList=[]
        downList.push(imgList[Math.floor(Math.random()*50)]['illust_id'])
        let downloadPixivImgById = address+'download';
        axios.post(downloadPixivImgById,{downList:JSON.stringify(downList)})
            .then((res)=>{
                let result = res.data;
                expect(result.code).toBe(200);
                expect(result.content).toBe('本次云端下载已开始');
                console.log(`pixivDownloadControl :单张图片下载开始`);
             })
        // 重复提交
        axios.post(downloadPixivImgById, { downList: JSON.stringify(downList) })
            .then((res) => {
                let result = res.data;
                expect(result.code).toBe(200);
                expect(result.content).toBe('云端下载中，且已将本次提交添加至队列');
            })
        //等待第一次的图片下完
        await new Promise((over)=>{
            function check(){
                setTimeout(()=>{
                    axios.post(downloadPixivImgById,{downList:JSON.stringify([])})
                        .then((res)=>{
                            let result = res.data;
                            if(result.content==='云端已就绪'){
                                expect(result.code).toBe(200);
                                expect(result.content).toBe('云端已就绪');
                                let endTime = new Date().getTime();
                                console.log(`pixivDownloadControl :单张图片下载结束,耗时：${startTiem-endTime} -ms`);
                                over()
                            }else{
                                check();
                            }
                        })
                },1000)
            }
            check();
        });
        for(let i =0;i<5;i++){
            downList.push(imgList[Math.floor(Math.random()*50)]['illust_id'])
        }
        startTiem = new Date().getTime();
        axios.post(downloadPixivImgById,{downList:JSON.stringify(downList)})
        .then((res)=>{
            let result = res.data;
            expect(result.code).toBe(200);
            expect(result.content).toBe('本次云端下载已开始');
            console.log(`pixivDownloadControl :多张图片下载开始`);
         })
        
        //等待第二次的图片下完
        await new Promise((over)=>{
            function check(){
                setTimeout(()=>{
                    axios.post(downloadPixivImgById,{downList:JSON.stringify([])})
                        .then((res)=>{
                            let result = res.data;
                            if(result.content==='云端已就绪'){
                                expect(result.code).toBe(200);
                                expect(result.content).toBe('云端已就绪');
                                let endTime = new Date().getTime();
                                console.log(`pixivDownloadControl :多张图片下载结束,耗时：${startTiem-endTime} -ms`);
                                over()
                            }else{
                                check();
                            }
                        })
                },1000)
            }
            check();
        });
        resolve()
    })
    return testProcess
},400000);


function getBeforeYesterday(){
    var need = new Date(new Date().getTime()-172800000);
    var year = need.getFullYear();
    var Month = addZero(need.getMonth()+1)
    var day= addZero(need.getDate());
    function addZero(num){
        var num = num.toString()
        if(num.length===1){
            num = '0'+num
        }
        return num
    }
    return year+'-'+Month+'-'+day

}