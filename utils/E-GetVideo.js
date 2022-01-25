const util = require('../utils/common')
var fs = require('fs')
var axios = require('axios');
var cheerio = require('cheerio');
var schedule = require('node-schedule');
var https = require("https")
var iconv = require("iconv-lite");

async function GetVideo(url, thumb, html) {
    console.log(url)
    if (url.indexOf("ecchi.iwara.tv") == -1) {
        console.log("错误的路径请求：/utils/E-GetVideo.js")
        return 0;
    } else {
        if (url.indexOf('?language=ja') != -1) {
            url.replace(/\?language=ja/g,'')
        }
        if (url.indexOf("undefined")) {
            url.replace("undefined", '')
        }
        
        //console.log("the result is" + data);
        var $ = cheerio.load(html);
        var title = $('body').find('h1').text();
        console.log('E视频标题为' + title);
        var description = $('.field-items').find('p').html();
        console.log('E视频简介为' + description);
        var DownloadAddr = url.replace('videos', 'api/video')
        console.log('E视频即时下载地址为' + DownloadAddr);
        var author = $('.node-info').find('a.username').text();
        console.log('E视频作者' + author)
        console.log("E缩略图" + thumb)
        console.log('E原视频地址' + url)
        if (!description) description = 'NULL';
        description.replace(/\s/g, '');
        
        var json = '{"title":"' + title + '","author":"' + author + '","description":"' + description.replace(/&|<|>|'|"|\n|\s|\s/g, function (matchStr) {
            var tokenMap = {
                '\s': '',
                '\s': '',
                '\n': '',
                ':': '\\:',
                '&': '&',
                '<': '<',
                '>': '>',
                "'": '&apos;',
                '"': '\''
            };
            return tokenMap[matchStr];
        }) + '","thumb":"' + thumb + '","download":"' + DownloadAddr + '","origin":"' + url + '"}'
        //配对视频代号
        var start_line = url.indexOf('/videos/');
        var id = "";
        for (i = 0; i < url.length; i++) {
            if (i >= start_line + 8) {
                id = id + url[i];
            }
        }
        if (id.indexOf('?language=ja') != -1) {
            id.replace(/\?language=ja/g, '')
        }
        console.log("E视频id为" + id);
        if (url.indexOf('?language=ja') != -1) {
            url.replace(/\?language=ja/g, '')
        }


        if(1){
        console.log('开始存储数据')
        fs.writeFileSync('./data/ecchi/' + id + '.json', json, function (err) {
            if (err) console.err(err)
        })
        }
        /*
        https.get(url, function (res) {  
            var datas = [];
            var size = 0;  
            res.on('data', function (data2) {  
                datas.push(data2);  
                size += data2.length;  
                
            });  
            res.on("end", function () {  
                var buff = Buffer.concat(datas, size);  
                var result = iconv.decode(buff, "utf8");//转码//var result = buff.toString();//不需要转编码,直接tostring  
                //console.log(result);  
            
            //console.log(response.data);
            data = result;
            //console.log("the result is" + data);
            var $ = cheerio.load(data);
            var title = $('body').find('h1').text();
            console.log('E视频标题为'+title);
            var description = $('.field-items').find('p').html();
            console.log('E视频简介为'+description);
            var DownloadAddr = url.replace('videos','api/video')
            console.log('E视频即时下载地址为'+DownloadAddr);
            var author = $('.node-info').find('a.username').text();
            console.log('E视频作者'+author)
            console.log("www缩略图"+thumb)
            console.log('E原视频地址'+url)
            description.replace(/\s/g,'');
            var json = '{"title":"'+title+'","author":"'+author+'","description":"'+ description.replace(/&|<|>|'|"|\n|\s|\s/g, function(matchStr) {
                var tokenMap = {
                '\s':'',
                '\s':'',
                '\n':'',
                ':': '\\:',
                '&': '&',
                '<': '<',
                '>': '>',
                "'": '&apos;',
                '"': '\''
            };
                return tokenMap[matchStr];
            })+'","thumb":"'+thumb+'","download":"'+DownloadAddr+'","origin":"'+url+'"}'
            //配对视频代号
            var start_line = url.indexOf('/videos/');
            var id = "";
            for(i=0;i<url.length;i++){
                if(i>=start_line+8){
                    id = id + url[i];
                }
            }
            
            console.log("E视频id为"+id);
            fs.writeFileSync('./data/www/'+id+'.json',json,function(err){
                if(err)console.err(err)
            })
            //process.stdout.write(data);  
            
*/

    }
}
/*
Example
GetVideo('https://www.iwara.tv/videos/ekea7ilk4dtmzq2bk',"undefined")
*/

module.exports = GetVideo