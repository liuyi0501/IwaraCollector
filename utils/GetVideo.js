var fs = require('fs')
var cheerio = require('cheerio');

function GetVideo(url, thumb, html) {
    console.log(url)
    if (url.indexOf("www.iwara.tv") == -1) {
        console.log("错误的路径请求：/utils/GetVideo.js")
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
        console.log('www视频标题为' + title);
        var description = $('.field-items').find('p').html();
        console.log('www视频简介为' + description);
        var DownloadAddr = url.replace('videos', 'api/video')
        console.log('www视频即时下载地址为' + DownloadAddr);
        var author = $('.node-info').find('a.username').text();
        var author_url = $('.node-info').find('a.username').attr('href');
        var author_picture = $('.user-picture').find('img').attr('src');
        var userData = $('.submitted').html();
        try{
        var postDate = userData.match(/\d{4}(\-|\/|.)\d{1,2}\1\d{1,2}\s?\d{2}\:\d{2}/)[0]
        }catch(err){
            if(err){
                postDate = "NULL";
            }
        }
        console.log('www视频作者' + author)
        console.log('www视频作者地址' + author_url)
        console.log('www视频作者头像' + author_picture)
        console.log("www缩略图" + thumb)
        console.log("www视频发布时间" + postDate)
        console.log('www原视频地址' + url)
        let d = new Date();
        let timeStr = d.getFullYear() +  "-" + Number(d.getMonth() + 1) + '-' + d.getDate();
        if (!description) description = 'NULL';
        description.replace(/\s/g, '');
        var json = {
            title: title,
            author: {
                name: author,
                url: author_url,
                picture: author_picture
            },
            description: description,
            thumb: thumb,
            download: DownloadAddr,
            origin: url,
            postDate: postDate,
            catchDate: timeStr,
            catchDateInt: d
        }
        //配对视频代号
        var id = url.substring(url.indexOf('/videos/') + 8 , url.indexOf('/videos/') + 25);
        console.log("www视频id为" + id);
        console.log('开始存储数据')
        fs.writeFileSync('./data/www/' + id + '.json', JSON.stringify(json), function (err) {
            if (err) console.err(err)
        })//存储视频数据
        var authorID = author_url.substring(author_url.indexOf('/users/')+7,author_url.length)
        if(authorID.indexOf('?language') != -1){
            authorID = authorID.substring(0,authorID.indexOf('?language'))
        }
        console.log(authorID)
        fs.exists('./data/author/www/index/' + authorID +'.json',function ifexist(exist){
            if(!exist){
                fs.writeFileSync('./data/author/www/index/' + authorID +'.json',JSON.stringify({
                    userLink: author_url
                }),function callback(err){
                    if(err)console.log(err)
                })//如果路径存在则失败，将用户ID纳入用户名索引/index/中，|| 数据格式为: /users/:authorID 
            }
        })
        
        fs.exists('./data/author/www/list/' + author +'.json',function ifexist(exist){
            if(!exist){
                fs.writeFileSync('./data/author/www/list/' + author +'.json',JSON.stringify({
                    userLink: author_url
                }),function callback(err){
                    if(err)console.log(err)
                } )//如果路径存在则失败，将用户目前昵称纳入昵称索引/list/中 || 数据格式为: /users/:authorID 
            }
        })
    }
}

module.exports = GetVideo