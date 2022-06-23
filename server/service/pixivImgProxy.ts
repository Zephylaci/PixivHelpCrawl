import * as fs from 'fs-extra';
import * as Path from 'path';
import * as stream from 'stream';
import { promisify } from 'util';
import { pathConfig } from '../../config';
import { fromFile } from 'file-type';
import { loggerErr, loggerRes, loggerShow } from '../utils/logger';
import { gotImgInstance } from '../utils/gotPixivImg';
import { StackHandler, retryWarp } from '../utils/tool';

const BasePath = pathConfig.cashPath;
fs.ensureDirSync(BasePath);
const pipeline = promisify(stream.pipeline);

export function parseTarget(target) {
    const pathInfo = Path.parse(target);
    const key = Buffer.from(pathInfo.dir).toString('base64');
    const targetName = `${key}-${pathInfo.name}${pathInfo.ext}`;
    const targetPath = Path.resolve(BasePath, `./${targetName}`);
    return {
        targetName,
        targetPath
    };
}

export function getTargetCash({ targetName, targetPath }) {
    if (fs.existsSync(targetPath)) {
        fs.stat(targetPath, (statErr, stat) => {
            if (statErr) {
                loggerErr.error('getTargetCash statErr:', targetPath, statErr);
                return;
            }
            fs.utimes(targetPath, new Date(), stat.mtime, function (timeErr) {
                if (timeErr) {
                    loggerErr.error('getTargetCash timeErr:', targetPath, timeErr);
                    return;
                }
            });
        });
        return fs.createReadStream(targetPath);
    }
    return null;
}

export function saveGotImgStream({ readStream, path }) {
    return new Promise(resolve => {
        readStream.on('response', async res => {
            // 请求成功
            if (res.statusCode !== 200) {
                resolve(false);
                return;
            }
            try {
                const savePath = `${path}.tmp`;
                await pipeline(readStream, fs.createWriteStream(savePath));
                // 下载文件完整性检查
                const size = Number(res.headers['content-length']);
                const mime = res.headers['content-type'];
                const fileInfo = fs.statSync(savePath);
                const fileType = await fromFile(savePath);
                if (
                    !isNaN(size) &&
                    fileInfo &&
                    fileType &&
                    fileInfo.size === size &&
                    fileType.mime === mime
                ) {
                    fs.renameSync(savePath, path);
                } else {
                    loggerShow.warn(
                        `saveGotImgStream download failed:`,
                        res.headers,
                        '\n',
                        fileInfo,
                        '\n',
                        fileType,
                        '\n',
                        path
                    );
                    resolve(false);
                    return;
                }
            } catch (error) {
                loggerShow.error(error);
                resolve(false);
                return;
            }

            resolve(true);
        });
    });
}

async function _gotImgAndSave({
    readStream,
    target,
    targetPath
}: {
    readStream?: any;
    target;
    targetPath;
}) {
    let stream = null;
    if (readStream) {
        stream = readStream;
    } else {
        loggerRes.info('gotImgAndSave make stream:', target);
        stream = gotImgInstance.stream(target, { throwHttpErrors: false });
    }
    let res = await saveGotImgStream({
        readStream: stream,
        path: targetPath
    });
    if (res === false) {
        throw new Error('gotImgAndSave Failed');
    }
}

export const gotImgAndSave = StackHandler.warpQuery(
    retryWarp(_gotImgAndSave, {
        onlyBeforeInRetry: true,
        before: async params => {
            params.readStream = null;
            return params;
        }
    }),
    {
        key: 'gotImgAndSave',
        limit: 20,
        makeCashKey: ({ target }) => {
            return target;
        }
    }
);
