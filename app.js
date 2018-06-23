const shell = require('child_process');

var server = shell.fork('server/www');

var crawl = shell.fork('server/pixivLogin.js');