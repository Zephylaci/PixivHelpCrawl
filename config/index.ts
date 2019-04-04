
const defConfig = {
    port: 8082,
    logConfig: {
        basePath: '../logs',
        level: 'watching' // debug watching  running  
    },
    cashConfig: {
        useCash: true,
        dbAddress: __dirname.match(/.*Help.*\\/)[0] + 'db\\production.db',
        cashPath: './client/cash/',
        autoCash: {
            enable: true,
            runDate: '11:30:00',
            plan: ['mode=daily', 'mode=rookie', 'mode=daily_r18', 'mode=weekly_r18', 'mode=male_r18', 'mode=weekly', 'mode=male'],
            deep: 2
        }
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
        useLinkProxy: true,
        linkProxyAddr: 'http://192.168.10.103:8118'
    },
    pathConfig: {
        webPath: './client',
        downloadPath: './client/download'
    },
    NoProcessStdout: false,
    execArgv: () => {
        return process.execArgv
    }
}

//调试时的设置
if (process.env.NODE_ENV === 'development') {
    defConfig.cashConfig.dbAddress = defConfig.cashConfig.dbAddress.replace('production', 'development');
    defConfig.cashConfig.autoCash.plan = ['mode=daily', 'mode=rookie'];

    //为了vscode 能调试子进程
    
    if (process.execArgv.indexOf('--inspect') !== -1) {
        defConfig.execArgv = function () {
            let port = Math.floor(Math.random() * 1000 + 10000);
            let execArgv = Object.assign([],process.execArgv);
            execArgv[execArgv.indexOf('--inspect')] = `--inspect=${port}`;
            return execArgv
        }
    }
    defConfig.logConfig.level = 'debug';
    defConfig.NoProcessStdout = false;
}

export let {
    cashConfig,
    pathConfig,
    pixivConfig,
    linkProxy,
    logConfig,
    execArgv,
    NoProcessStdout,
} = defConfig;
export default defConfig;

