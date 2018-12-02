const getPixivHotList = require('../api/PixivCrawler/getPixivHotList.js');

let mockQuery = {
    type: 'mode=daily',
    date: '2018-12-01',
    startPage: 1,
    endPage: 1,
}
let ctx = {
    request:{
        body:mockQuery
    }
}

test('getPixivHotList', () => {
    getPixivHotList.contrl(ctx).then((res)=>{
        let result = res.body;
        expect(result.code).toBe(200);
        expect(result.contents.length).toBe(50);
    })
});