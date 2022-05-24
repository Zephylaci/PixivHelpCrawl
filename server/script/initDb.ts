import { getDbControl } from '../module/dao';

getDbControl().then(handler => {
    handler.sync({ force: true });
});
