
const defConfig = {
    port: 8082,
    logConfig: {
        basePath: '../logs',
        level: 'watching' // debug watching  running  
    },
    cashConfig: {
        useCash: false,
        dbAddress:'./client/cash',
        cashPath:'',
        autoCash: {
            enable: false,
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
        useLinkProxy:true,
        linkProxyAddr: 'http://192.168.10.103:8118'
    },
    pathConfig: {
        webPath: './client',
        downloadPath: './client/download'
    },
    NoProcessStdout: false,
    execArgv:process.execArgv
}

//调试时的设置
if (process.env.NODE_ENV === 'development') {
    //为了vscode 能调试子进程
    let execArgv = defConfig.execArgv
    let port = Math.floor(Math.random()*1000+10000);
    if(execArgv.indexOf('--inspect')!==-1){
        execArgv[execArgv.indexOf('--inspect')] = `--inspect=${port}`;
    }else{
        execArgv.unshift(`--inspect=${port}`);
    }
    defConfig.execArgv = execArgv;
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

