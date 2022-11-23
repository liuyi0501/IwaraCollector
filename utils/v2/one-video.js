var axios = require('axios')
var cheerio = require('cheerio');
//var redis = require("../../utils/redisDB")

var video = async (site, id) => {
    /*
    @params site: www, ecchi
    @params id: Video ID
    */
    //https://www.iwara.tv/videos/darmyfb5xvcmxgood
    
    let url = 'https://'+site+'.iwara.tv/videos/'+id;
    let opt = {
        method: 'GET',
        header: {
            referer: 'https://'+site+'.iwara.tv/',
            accept: 'text/html',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
            cookie: 'has_js=1; _gid=GA1.2.2101679399.1659614575; _ga_PK7DE1RR8V=GS1.1.1659614575.1.1.1659614740.0; _ga=GA1.1.849307151.1659614575; __cf_bm=B6ELO2Mc5lKS_ffz2ZJ5RONeAKieSIllfeTscm7yPOw-1659614745-0-AcvzOM6yvDHxXOaQQsXaPtM5zzdeHD4qtNB9ryOJT8ID1kIQsvJzNaQEWOney4uTul7fHr8Cu4IZpABQy+3Tlj+KwaDI4SjyoL71rP7VWzyimtwTNNefbr+C+DPh73jQ7w=='
        },
        timeout: 0
    }
    
    var videoKey = 'iwara:'+site+':video:v2:'+id;
    console.log('videoKey:',videoKey);
    let result = await new Promise((resolve)=>{
        /*redis.get(videoKey).then((dbData) => {
            var catchedTime = 0;
            if ( dbData )
                if ( dbData.catchTime )
                    catchedTime = Number(dbData.catchTime)!=NaN?Number(dbData.catchTime):0;
            if ( dbData && catchedTime+1000*60*60*24*30 - Date.now() >= 0){
                resolve({
                err:0,
                message: '距离上次爬取未到30天:'+id+'不进行爬取'
                })
            } else */
        axios.get(encodeURI(url), opt).then((response)=>{
            let data = response.data;
            var $ = cheerio.load(data); //格式化html数据
            
            //获取视频标题
            var title = $('body').find('h1').text();
            
            //获取用户名
            var author_url = $('.node-info').find('a.username').attr('href');
            var author = author_url.match(/(?<=\/users\/).*/)[0];
            author_encode = encodeURI(author)
            var userData = $('.submitted').html();
            var desc = $('.field-type-text-with-summary').find('div.field-items').html();
            
            var tag = [];
            $('.field-name-field-categories').children('.field-items').children('div').children('*').each(function (i, ele){
                tag.push(encodeURI($(this).text()))
                //tag.push($(this).text());
            })
            if( !tag )tag = ['Uncategorized'];
            //console.log(tag);
            
            //检测是否为YouTube外链视频
            if( !$('div.player').html ){
                youtube = null;
            } else {
                youtube = $('div.player').html();
            }
            
            var thumb = null;
            var thumb_id = null;
            if ( youtube == null ){//如果不是外链视频，那么可以找到封面
                thumb = $('video').attr('poster');
                thumb_id = thumb.match(/(?<=thumbnails\/)\d+/)[0]
            }
            
            var userData = $('.submitted').html();
            try{
            var postDate = userData.match(/\d{4}(\-|\/|.)\d{1,2}\1\d{1,2}\s?\d{2}\:\d{2}/)[0]
            }catch(err){
                if(err){
                    postDate = "NULL";
                }
            }
            var time = + new Date(postDate).getTime();
            console.log(time)
            
            var likeAndWatch = $('.node-views').text().match(/\S+/g)
            var watchNum = likeAndWatch[1].replaceAll(',','');
            var likeNum = likeAndWatch[0].replaceAll(',','');
            
            
            var json = {
                title: title,
                postDate: postDate,
                timestamp: time,
                id: id,
                thumb: thumb,
                author: author,
                thumb_id: thumb_id,
                desc: desc,
                tag: tag,
                catchTime: Date.now(),
                watchNum: watchNum,
                likeNum: likeNum,
                other: {
                    youtube: youtube,
                }
            }
            
            /* 爬取任务结束，进行数据库存入 */
            //存入作者数据
            
            var authorKey;
            if( decodeURIComponent(author) != author){
                //说明已经被编码过了，直接用
                authorKey = 'iwara:'+site+':video:v2:user:'+author;
            } else {
                authorKey = 'iwara:'+site+':video:v2:user:'+author_encode;
            }
            authorKey = 'iwara:'+site+':video:v2:user:'+author;
            var authorListKey = 'iwara:'+site+':video:v2:userList';
            console.log('authorKey', authorKey);
            console.log('authorListKey', authorListKey);
            console.log(authorKey, id, time);
            console.log(authorListKey, author, 1);
            
            
            //Like: iwara:www:video:v2:asdasdasdasdasd;
            //存入视频主要数据
            console.log(videoKey, json);
            
            var videoListKey = 'iwara:'+site+':video:v2:list';
            console.log('videoListKey:',videoListKey);
            //存入视频列表数据
            //Key, member, Num
            console.log(videoListKey, id, time);
            //redis.zincrby(watchDailyKey, timeStr, 1);
            
            var videoLikeKey = 'iwara:'+site+':video:v2:like';
            console.log('videoLikeKey:',videoLikeKey);
            //存入视频喜欢数据
            //Key, member, Num
            console.log(videoLikeKey, id, likeNum);
            
            var videoWatchKey = 'iwara:'+site+':video:v2:watch';
            console.log('videoWatchKey:',videoWatchKey);
            //存入视频喜欢数据
            //Key, member, Num
            console.log(videoWatchKey, id, watchNum);
            
            
            //存入TAG
            for( i = 0 ; i < tag.length ; i++){
                var tagKey = 'iwara:'+site+':video:v2:tag:'+tag[i];
                var tagListKey = 'iwara:'+site+':video:v2:tagList';
                console.log('tagKey:', tagKey);
                //存入 TAG 数据
                console.log(tagListKey, tag[i], 1);
                console.log(tagKey, id, time);
                console.log('存入TAG数据成功')
            }
            let now_time = Date.now()
            while(now_time + 100 - Date.now() >=0){}
            resolve({
                err:0,
                message: '爬取'+id+'成功'
            })
        }).catch((err)=>{
            console.log(err);
            resolve({
                err:1,
                message:err
            })
        })
            
    })
    return result;
    
}
//exports.video = video;

//https://ecchi.iwara.tv/videos/kq7v4s6xymukkk5xm
video('ecchi', 'kq7v4s6xymukkk5xm').then((res)=>{
    console.log(res);
})

