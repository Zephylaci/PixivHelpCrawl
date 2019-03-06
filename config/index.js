var fs = require('fs');
var defConfig = {
    port: 8082,
    mysqlConfig: {
        useMysql: true,
        host: '',
        user: '',
        password: '',
        port: '3386',
        database: '',
        charset: 'utf8mb4',
        connectTimeout: 180000
    },
    log: {
        basePath: '../logs',
        level: 'debug' // debug watching  running  
    },
    redisConfig: {
        useCash: false,
        autoCash: {
            enable: false,
            runDate: '11:30:00',
            plan: ['mode=daily', 'mode=rookie', 'mode=daily_r18', 'mode=weekly_r18', 'mode=male_r18', 'mode=weekly', 'mode=male'],
            deep: 2
        },
        host: '127.0.0.1',
        port: '4001',
        passwd: ''
    },
    pixivConfig: {
        form: {
            pixiv_id: '',
            password: '',
            captcha: "",
            g_recaptcha_response: "",
            post_key: "",
            source: "pc"
        },
        headers: {
            'Referer': "http://www.pixiv.net",
            'User-Agent': "Mozilla/5.0 (Windows NT 6.3; rv:27.0) Gecko/20100101 Firefox/27.0",
        },
        cookieAbout: {
            path: '.cookie',
            cookies: null
        }
    },
    linkProxy: {
        useLinkProxy: false,
        linkProxyAddr: ''

    },
    pathConfig: {
        webPath: './client',
        downloadPath: './client/download'
    },
    NoProcessStdout: false,
    execArgv:process.execArgv
}
console.log(process.execArgv);

if (fs.existsSync('./config/config.js')) {
    let myConfig = require('./config.js')
    defConfig = Object.assign(defConfig, myConfig)
}

//调试时得设置
console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
    defConfig.execArgv = ['--inspect-brk','C:\\workSpace\\pixivHelp\\node_modules\\_ts-node@7.0.1@ts-node\\dist\\bin.js'];
    defConfig.NoProcessStdout = false;
}

export let { NoProcessStdout,execArgv, pixivConfig, redisConfig, pathConfig, mysqlConfig, linkProxy } = defConfig;

export default defConfig;
module.exports = defConfig;

