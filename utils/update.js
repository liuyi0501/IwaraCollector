/*
*
*Alert: This is OLD CODE, which is used to update data from iwara. 
*Version: 1
*
*/

const child_process = require('child_process');
const schedule = require('node-schedule');
function update() {
//创建三个子进程
    schedule.scheduleJob('1 1 1 * * *',()=>{
        console.log('scheduleCronstyle:' + new Date());
        var workerProcess_E_GetAllvideo = child_process.exec('node ./utils/E-GetAllVideo.js', function (error, stdout, stderr) {
            if (error) {
                console.log(error.stack);
                console.log('Error code: '+error.code);
                console.log('Signal received: '+error.signal);
            }
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
        });
        workerProcess_E_GetAllvideo.on('exit', function (code) {
            console.log('E-GetAllVideo子进程已退出，退出码 '+code);
        });
        /*
        -------------------------------------------------
        */
        var workerProcess_GetAllvideo = child_process.exec('node ./utils/GetAllVideo.js', function (error, stdout, stderr) {
            if (error) {
                console.log(error.stack);
                console.log('Error code: '+error.code);
                console.log('Signal received: '+error.signal);
            }
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
        });
        workerProcess_GetAllvideo.on('exit', function (code) {
            console.log('GetAllVideo子进程已退出，退出码 '+code);
        });
        /*
        -------------------------------------------------
        */
        var workerProcess_E_GetLikevideo = child_process.exec('node ./utils/E-GetLikeVideo.js', function (error, stdout, stderr) {
            if (error) {
                console.log(error.stack);
                console.log('Error code: '+error.code);
                console.log('Signal received: '+error.signal);
            }
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
        });
        workerProcess_E_GetLikevideo.on('exit', function (code) {
            console.log('E-GetLikeVideo子进程已退出，退出码 '+code);
        });
        /*
        -------------------------------------------------
        */
        var workerProcess_GetLikevideo = child_process.exec('node ./utils/GetLikeVideo.js', function (error, stdout, stderr) {
            if (error) {
                console.log(error.stack);
                console.log('Error code: '+error.code);
                console.log('Signal received: '+error.signal);
            }
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
        });
        workerProcess_GetLikevideo.on('exit', function (code) {
            console.log('GetLikeVideo子进程已退出，退出码 '+code);
        });
        /*
        -------------------------------------------------
        */
        var workerProcess_E_GetAuthor = child_process.exec('node ./utils/E-GetAuthor.js', function (error, stdout, stderr) {
            if (error) {
                console.log(error.stack);
                console.log('Error code: '+error.code);
                console.log('Signal received: '+error.signal);
            }
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
        });
        workerProcess_E_GetAuthor.on('exit', function (code) {
            console.log('E-GetAuthor子进程已退出，退出码 '+code);
        });
        /*
        -------------------------------------------------
        */
        var workerProcess_GetAuthor = child_process.exec('node ./utils/GetAuthor.js', function (error, stdout, stderr) {
            if (error) {
                console.log(error.stack);
                console.log('Error code: '+error.code);
                console.log('Signal received: '+error.signal);
            }
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
        });
        workerProcess_E_GetAuthor.on('exit', function (code) {
            console.log('GetAuthor子进程已退出，退出码 '+code);
        });
    });
}
//update();
//console.log('自动更新数据已启动')
module.exports = update;