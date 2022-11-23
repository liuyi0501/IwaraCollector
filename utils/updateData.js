/*
*
*Version: 2
*
*
*/
const child_process = require('child_process');
const schedule = require('node-schedule');
var {getPage} = require('../utils/v2/list')
var {getAuthor} = require('../utils/v2/user')

function update() {
        getPage('ecchi')
        getPage('www')
        getAuthor('ecchi')
        getAuthor('www')

}
    schedule.scheduleJob('1 1 1 * * *',()=>{
        getPage('ecchi')
        getPage('www')
        getAuthor('ecchi')
        getAuthor('www')
    });
//update();
//console.log('自动更新数据已启动')
//module.exports = update;

/*
const child_process = require('child_process');
const schedule = require('node-schedule');
*/


/*
getPage('ecchi')
getPage('www')
getAuthor('ecchi')
getAuthor('www')
*/
console.log('自动更新数据已启动')
module.exports = update;
/*

const E_GetAllVideo = require('./E-GetAllVideo.js')
const GetAllVideo = require('./GetAllVideo.js')
const E_GetLikeVideo = require('./E-GetLikeVideo.js')
const GetLikeVideo = require('./GetLikeVideo.js')
const E_GetAuthor = require('./E-GetAuthor.js')
const GetAuthor = require('./GetAuthor.js')

function update() {
//创建三个子进程
    schedule.scheduleJob('1 1 1 * * *',()=>{
        E_GetAllVideo();
        GetAllVideo();
        E_GetLikeVideo();
        GetLikeVideo();
        E_GetAuthor();
        GetAuthor();
    });
}
//update();
console.log('自动更新数据已启动')
module.exports = update;

*/