var  fs = require( 'fs');
var development_env ={                                                                                                                                                                                             
    port: 8082,                                                                                                                                                                                                    
    mysqlConfig: {
        useMysql:true,
		host: '',
		user: '',
		password: '',
		port: '3386',
        database: '',
        charset:'utf8mb4',
		connectTimeout: 180000
    },
    log:{
        basePath:'../logs',
        level:'debug' // debug watching  running  
    },
	redisConfig:{                                                                                                                                                                                                
        useCash:false,                                                                                                                                                                                            
        autoCash:{                                                                                                                                                                                               
            enable:false,                                                                                                                                                                                         
            runDate:'11:30:00',
            plan:['mode=daily','mode=rookie','mode=daily_r18','mode=weekly_r18','mode=male_r18','mode=weekly','mode=male'],
           deep:2                                                                                                                                                                                                
        },                                                                                                                                                                                                       
        host:'127.0.0.1',
        port:'4001',
        passwd:''
    },                                                                                                                                                                                                                                                                                                                                                                                      
    pixivConfig:{                                                                                                                                                                                                  
        form :{                                                                                                                                                                                                    
            pixiv_id:'',                                                                                                                                                                           
            password:'',                                                                                                                                                                             
            captcha:  "",                                                                                                                                                                                          
            g_recaptcha_response:"",                                                                                                                                                                               
            post_key: "",                                                                                                                                                                                          
            source: "pc"                                                                                                                                                                                           
        },                                                                                                                                                                                                         
        headers:{                                                                                                                                                                                                  
            'Referer':"http://www.pixiv.net",                                                                                                                                                                      
            'User-Agent':"Mozilla/5.0 (Windows NT 6.3; rv:27.0) Gecko/20100101 Firefox/27.0",                                                                                                                      
        },                                                                                                                                                                                                         
        cookieAbout:{                                                                                                                                                                                              
            path:'.cookie',                                                                                                                                                                                        
            cookies:null                                                                                                                                                                                           
        }                                                                                                                                                                                                    
    },
    linkProxy:{
        useLinkProxy:false,
        linkProxyAddr: ''
       
    },
    pathConfig:{                                                                                                                                                                                                   
        webPath:'./client',                                                                                                                                                                                        
        downloadPath:'./client/download'                                                                                                                                                                          
    }                                                                                                                                                                                                              

}    

if(fs.existsSync('./config/config.js')){
    let my_dev = require('./config.js')
    development_env = Object.assign(development_env,my_dev)
}

export let {pixivConfig,redisConfig,pathConfig,mysqlConfig,linkProxy} = development_env;
export default development_env;   

module.exports = development_env;
                                                                                                                                                                                 
