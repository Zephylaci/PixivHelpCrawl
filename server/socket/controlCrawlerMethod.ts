import controlCash from '../service/controlCash';
let delPlanStore = {};

const methodMap = {
    init: ({
        clientSocket,
    }) => {
        let result: any = controlCash.getPreViewState({
            needState: ['count', 'totalSize', 'firstCreat']
        });
        if (result.totalSize !== 0) {
            result.totalSize = Math.ceil(result.totalSize / 1048576);
            result.firstCreat = new Date(result.firstCreat).toLocaleString();
        } else {
            result.totalSize = '无';
        }
        clientSocket.local.emit('controlCrawler-changePreViewState', {
            contents: result
        });
        controlCash.getRedisState().then((res) => {
            var result = {
                count: res.totalCount
            }
            clientSocket.local.emit('controlCrawler-changeRedisState', {
                contents: result
            });
        });

    },
    delPreView: async ({
        clientSocket,
        data,
    }) => {
        let beforeTimeDate = new Date(data.beforeTime).getTime();

        let result = await controlCash.makeViewDelList({
            beforeTime: beforeTimeDate
        });
        let planKey = new Date().getTime();
        if (result.delList.length > 0) {
            delPlanStore[planKey] = result.delList;
            clientSocket.local.emit('controlCrawler-delViewCheck', {
                contents: {
                    planKey,
                    conut: result.count,
                    delCount: result.delList.length,
                    beforeTime: data.beforeTime
                }
            });
        };

    },
    delUnusePreView: ({
        clientSocket,
        data,
    }) => {
        let beforeTimeDate = new Date(data.beforeTime).getTime();

        controlCash.makeViewDelList({
            beforeTime: beforeTimeDate,
            checkUse: true,
        }).then((result) => {
            let planKey = new Date().getTime();
            if (result.delList.length > 0) {
                delPlanStore[planKey] = result.delList;
                clientSocket.local.emit('controlCrawler-delViewCheck', {
                    contents: {
                        planKey,
                        conut: result.count,
                        delCount: result.delList.length,
                        beforeTime: data.beforeTime
                    }
                });
            };
        });


    },
    delRedisData: ({
        clientSocket,
        data,
    }) => {
        let beforeTimeDate = new Date(data.beforeTime).getTime();

        controlCash.makeRedisDelList({
            beforeTime: beforeTimeDate
        }).then((result) => {
            let planKey = new Date().getTime();
            if (result.delList.length > 0) {
                delPlanStore[planKey] = result.delList;
                clientSocket.local.emit('controlCrawler-delRedisCheck', {
                    contents: {
                        planKey,
                        delCount: result.delCount,
                        beforeTime: data.beforeTime
                    }
                });
            }
        });

    },
    delPlane: ({
        clientSocket,
        data,
    }) => {
        if (data.type === 'confirm') {
            var delList = delPlanStore[data.planKey];
            if (typeof delList[0] === 'string') {
                controlCash.delViewForlist(delList);
                methodMap.init({ clientSocket });
            } else {
                controlCash.delRedisDataForList(delList).then(() => {
                    methodMap.init({ clientSocket });
                });
            }


        }
        delPlanStore[data.planKey] = null;
        delete delPlanStore[data.planKey]
    }
}

export default methodMap