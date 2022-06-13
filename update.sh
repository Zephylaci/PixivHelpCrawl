#bin/bash
yarn build && 
cd ./build &&
rm ./dist.tar  -rf&&
tar -cvf ./dist.tar ./dist/* && 
expect -c 'spawn ssh pi@192.168.10.103; 
                    expect "$"; 
                        send "cd ./NodeProject/pixivDisk/ \r";
                    expect "$";
                        send "rm ./dist ./dist.tar -rf \r"; 
                    expect "$";
                        send "exit \r";
                    expect eof;
                    interact'&&
scp ./dist.tar pi@192.168.10.103:/home/pi/NodeProject/pixivDisk/dist.tar &&
expect -c 'spawn ssh pi@192.168.10.103; 
                    expect "$"; 
                        send "cd ./NodeProject/pixivDisk/ \r";
                    expect "$";
                        send "tar -xvf ./dist.tar \r"
                    expect "$";
                        send "pm2 restart pixivHelp \r"
                    expect "$";
                        send "pm2 log pixivHelp \r";
                    interact'





              

