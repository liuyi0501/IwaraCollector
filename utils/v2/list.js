var axios = require('axios');
var cheerio = require('cheerio');
var redis = require("../../utils/redisDB");
var {video} = require("../../utils/v2/video");



var getPage = async (site, tempUrl, page, allPage) => {
    //第一页调用(site)，此时没有url,page,allPage
    if ( !page ){
        page = 0;//没有page则爬取第一页
    }
    var noUrl = 0;
    var url;
    if( !tempUrl ){
        //如果没有tempUrl模板，那么使用默认
        //（注意，tempUrl应该为此格式：https://www.iwara.tv/videos/Loq1Fk2WHpybA1w?playlist=54735&page=）
        url = 'https://'+site+'.iwara.tv/videos/?sort=1&page='+page;
        noUrl = 1;
    } else {
        url = tempUrl + page;
    }
    var opt = {
        method: 'GET',
        header: {
            referer: 'https://'+site+'.iwara.tv/',
            accept: 'text/html',
            'x-forwarded-for':'8.8.8.8',
        },
        params:{
            sort:'date',
        },
        timeout: 0
    }
    axios.get(url, opt).then((response) => {
        var data = response.data;
        var $ = cheerio.load(data);
        console.log($)
        if ( !allPage || allPage == 100 ){
            //获取最大页数
            var all = $('li.pager-last').children('a').attr('href')
            console.log(all)
            if( !all )
                allPage = 100;
            else
                allPage = all.match(/(?<=page=)\d+/)[0]
        }
        if ( noUrl = 1 ){
            //如果是第一次运行爬虫，那么可能需要获得列表链接
            var all = $('li.pager-last').children('a').attr('href')
            var pattern1 = /(?<=videos\/)\w+/;
            if ( pattern1.test(all) ){
                tempUrl = 'https://'+site+'.iwara.tv/videos/'+all.match(pattern1)[0]+'?page=';
            } else {
                
                tempUrl = 'https://'+site+'.iwara.tv/videos/?sort=1&page=';
                console.log('无法获取模板Url，使用默认模板',tempUrl)
            }
        }
        console.log('总共页数', allPage)
        
        //获取视频链接
        var videos = []
        $('h3.title').each(function (i, ele) {
            videos.push($(this).find('a').attr('href'))
        })
        catchVideo(site, videos, 0, [site, tempUrl, page, allPage])
    })
}
var catchVideo =  (site, videos, i, getPageArr) => {
    console.log(getPageArr)
    if ( i >= videos.length ){
        let tempUrl = getPageArr[1]
        let page = getPageArr[2] 
        let allPage = getPageArr[3]
        if(page < allPage)
            getPage(site, tempUrl, ++page, allPage);
        else
            console.log('所有列表页均爬取完毕')
    } else {
        let id = videos[i].match(/(?<=videos\/)\w+/)
        console.log('/----------/\n',i,'\n/----------/')
        let timeNow = Date.now();
        video(site, id).then((result) => {
            console.log(result.message)
            
            let timeNow = Date.now();

            catchVideo(site, videos, ++i, getPageArr)
        })
    }
}

exports.getPage = getPage;