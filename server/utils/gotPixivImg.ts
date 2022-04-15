import got from 'got';
import * as httpsProxyAgent from 'https-proxy-agent';
import { pixivConfig, linkProxy } from '../../config';

const baseUrl = 'https://i.pximg.net/';
let agent = null;
if (linkProxy.useLinkProxy) {
    agent = {
        https: httpsProxyAgent(linkProxy.linkProxyAddr)
    };
}

export const gotImgInstance = got.extend({
    prefixUrl: baseUrl,
    headers: pixivConfig.headers,
    agent
});
