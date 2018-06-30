process.on('message', (opt)=>{
    
    var parames = opt.parames;
    eval(opt.callBackStr);

    childFun(parames); 
})