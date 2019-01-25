import pixivSearch from '../service/pixivSearch';

const methodMap = {
    init: ({
        clientSocket,
    }) => {
        console.log('init');
        let keyList = pixivSearch.getList();
        let result = [];
        keyList.forEach((planKey) => {
            let item = {
                planKey,
                state: pixivSearch.getStateByKey(planKey)
            };
            result.push(item);
        });
        clientSocket.local.emit('doSearch-addList', {
            contents: result
        })
    },
    makeSeachPlan: ({
        clientSocket,
        data,
    }) => {
        let {
            strKey = "",
            isSafe = false,
            cashPreview = false,
            startPage = 1,
            endPage = 2,
            bookmarkCountLimit = 100,
        } = data;

        if (typeof isSafe === 'string') {
            isSafe = isSafe === 'false' ? false : true;
            cashPreview = cashPreview === 'false' ? false : true;
        }
        if (startPage > endPage) {
            endPage = startPage
        }
        let planRes = pixivSearch.makePlan({
            strKey,
            isSafe,
            cashPreview,
            startPage,
            endPage,
            bookmarkCountLimit
        });
        let planKey = planRes.planKey;
        let state = pixivSearch.getStateByKey(planKey);
        let result = [
            {
                planKey,
                state,

            }
        ];
        clientSocket.local.emit('doSearch-addList', {
            contents: result,
            change: planKey
        });
        let watchObj = pixivSearch.watchChange(planKey);

        watchObj.change = () => {
            var result = {
                planKey,
                state: pixivSearch.getStateByKey(planKey)
            }
            clientSocket.local.emit('doSearch-changeState', {
                contents: result
            });

        }
    }
}
export default methodMap