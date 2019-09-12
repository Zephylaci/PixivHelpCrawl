//bashDir:__dirname.match(/.*Help.*\\/)[0],

const defConfig = {
    port: 8082,
    //日志设置
    logConfig: {
        basePath: './logs',
        level: 'debug' // debug watching  running  
    },
    cashConfig: {
        useCash: true,
        //sqlite 数据库文件地址 
        dbAddress:'./db/production.db',
        /**
         * 自动缓存
         * 如果开启：每天11:30 会自动请求plan中配置的类型的前两页
         */
        autoCash: {
            enable: false,
            runDate: '11:30:00',
            plan: ['mode=daily', 'mode=rookie', 'mode=daily_r18', 'mode=weekly_r18', 'mode=male_r18', 'mode=weekly', 'mode=male'],
            deep: 2
        }
    },
    /**
    * pixiv_id  p站用户名
    *  password p站密码
    *  这个配置用于模拟登录
    */
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
        //cokie文件的位置
        cookieAbout: {
            path: '.cookie',
            cookies: null
        }
    },
    //代理配置 使用代理访问
    linkProxy: {
        useLinkProxy: false,
        linkProxyAddr: 'http://192.168.10.103:8118'
    },
    pathConfig: {
        webPath: './client',
        downloadPath: './client/download',
        cashPath:'./client/cash'
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
    defConfig.port = 8081;
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

