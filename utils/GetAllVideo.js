const util = require('../utils/common')
var fs = require('fs')
var axios = require('axios');
var cheerio = require('cheerio');
var schedule = require('node-schedule');
var GetVideo = require('../utils/GetVideo')
var https = require("https");
var iconv = require("iconv-lite");

var iwara = axios.create({
    baseURL: "https://www.iwara.tv",
    tieout: 1000,
    headers: { 
        'X-Custom-Header':'wobbay',
        'Referer':'https://www.iwara.tv/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36'
    },
    method: "get",
    httpsAgent: new https.Agent({ keepAlive: false})
})//实例一个请求
function GetPage(LastPage, d) {
    if (!d) {
        d = 1;
    }
    console.log("开始发送第"+d+"页请求")
    
    ecchi.get('/videos?page=' + d).then(response =>{
        if(response.statusText != "OK"){
            console.log("status error: /videos?page="+ d);
            throw err;
        }else{
            console.log("status OK: /videos?page="+ d);
            var data = response.data;
            var $ = cheerio.load(data); //格式化html数据
        //console.log(pages.indexOf('page='))
            let video = []
            let thumb = []
            $('h3.title').each(function (i, ele) {
                video.push($(this).find('a').attr('href'))//获取视频标题
            })
            $('.field-items').each(function (i, ele) {
                thumb.push($(this).find('img').attr('src'))//获取视频图片
            })
            VideoGet(video, thumb);//开始爬取视频内容
            fs.writeFileSync('./data/www/page/'+d+'.json','{"video":["'+video.join('","')+'"]}', function (err) {
                if (err) console.log(err);//静态存储每一页的数据
            })
            d++;//页数自增
            if (d <= LastPage) GetPage(LastPage, d)//在页数小于最大页数的情况下递归
            }
        }).catch(function(error){
        console.log(error)
        //throw "GetPage Err"
        console.log("Get Page Error: Get "+d+" Page Error\n\tTry Again")
        GetPage(LastPage, d)
    })
}

function VideoGet(video, thumb, q) {
    if (!q) {// q 为video和thumb的序号，用于记录递归到同一页面哪条数据
        q = 0
    }
    let second = Date.now();

    while (Number(Date.now()) <= Number(second) + 2000) { //暂停2秒，防止被墙拉黑
        //等待1秒，什么都不做
    }
    console.log("---------")
    console.log("开始爬取视频" + video[q])
    console.log("Address is " + "https://www.iwara.tv" + video[q])
    var start_line = video[q].indexOf('/videos/');
    var id = "";
    for (i = 0; i < video[q].length; i++) {//获取视频的17位ID
        if (i >= start_line + 8) {
                id = id + video[q][i];
            }
        }
    if (id.indexOf('?language=ja') != -1) {
            id.replace(/\?language=ja/g, '')
        }
    fs.exists('./data/www/' + id + '.json',function(exist){//检查是否记录过，有则跳过
        if(!exist){
            ecchi(video[q]).then(response =>{
                    if(response.statusText != "OK"){
                        console.log("status error: "+ video[q]);
                        throw err;
                    }else{
                        var data = response.data;
                        console.log("爬取%s完成",video[q])
                        GetVideo("https://www.iwara.tv" + video[q], thumb[q], data)//静态存储此视频的数据
                        q++;
                        if (q < video.length) VideoGet(video, thumb, q)//在序数小于最大数的情况下递归下一条数据
                    }
            }).catch(function(error){
                console.log(error)
                console.log("Error At VideoGet In http")
                VideoGet(video, thumb, q)//重新爬取视频数据
            })
        }else{
            console.log(video[q] + " have exist and pass")
            q++;
            if (q < video.length) VideoGet(video, thumb, q)
        }
    })
}
function GetAllVideo() {
    
    console.log("开始发送第一页请求")
    axios.get('https://www.iwara.tv/videos', {//获取页面信息
        referer: 'https://www.iwara.tv/',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36'
    }).then(response => {
        try{
        console.log("第一页请求发送并接收完毕")
        //console.log(response.data);
        var data = response.data;
        //console.log("the result is" + data);
        var $ = cheerio.load(data);
        var pages = $('.pager-last').find('a').attr("href")
        //console.log(pages.indexOf('page='))
        var start = pages.indexOf('page=') 
        }catch(err){//排查第一页请求
            console.error("error Occour At 121")
            let second = Date.now();
            while (Number(Date.now()) <= Number(second) + 1000) {
        //等待1秒，什么都不做
        }
            GetAllVideo()
            return 0;
        }
        var PageLast = ""
        for (i = 0; i < pages.length; i++) {
            if (i >= start + 5) {
                PageLast = PageLast + pages[i]
            }
        }
        console.log('最后一页' + PageLast)
        fs.writeFileSync('./data/www/page/all.json','{"LastPage":"'+PageLast+'"}',function(err){
            if(err)throw(err)
        })
        let video = []
        let thumb = []
        $('h3.title').each(function (i, ele) {
            video.push($(this).find('a').attr('href'))

        })
        $('.field-items').each(function (i, ele) {
            thumb.push($(this).find('img').attr('src'))
        })
        VideoGet(video, thumb);
        fs.writeFileSync('./data/www/page/'+0+'.json','{"video":["'+video.join('","')+'"]}', function (err) {
                if (err) console.log(err);
        })
        console.log("第一页提取完成")
        GetPage(PageLast)
    })
    

    
}

GetAllVideo()

module.exports = {
    GetAllVideo,
}