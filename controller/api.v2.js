const util = require('../utils/common')
const redis = require('../utils/redisDB');
const {video} = require('../utils/v2//video');

var async = require('async');
exports.index = (req, res) => {
    res.json(util.getReturnData(200, '欢迎来到IwaraCollector API v2'))
}

exports.video = (req, res) => {
    var site = req.params.site;
    var id = req.params.id;
    var videoKey = 'iwara:'+site+':video:v2:'+id;
    redis.get(videoKey).then((data)=>{
        if ( data )res.json(util.getReturnData(200,  '获取视频数据成功', data))
        else res.json(util.getReturnData(404, '获取视频数据失败，数据库中未找到'))
    })
}

exports.videos = (req, res) => {
    var site = req.params.site;
    if ( !site || ( site != 'www' && site != 'ecchi' ) )res.json(util.getReturnData(403, '错误的站点选项:'+site))
    var videos = req.query.videos;
    videos = videos.split(',')
    console.log(videos)
    async.mapLimit(videos, videos.length, (item, callback)=>{
        let videoKey = 'iwara:'+site+':video:v2:'+item;
        console.log(videoKey);
        redis.get(videoKey).then((data)=>{
            
            callback(null, data)
        })
    }, (err, result)=>{
        console.log(result)
        if ( !result )
            res.json(util.getReturnData(404, '查询不到数据'+videos))
        else
            res.json(util.getReturnData(200, '获取视频数组详细信息成功', result))
    })
    
}

exports.sort = (req, res) => {
    var site = req.params.site;
    if ( !site || (site != 'www' && site != 'ecchi'))res.json(util.getReturnData(403, '错误的站点选项:'+site))
    var sort = req.params.sort;
    var size = req.query.size?req.query.size:36;
    if( size <= 0 )size = 36
    var page = req.query.page?req.query.page:1;
    var start = 0 + size * ( page - 1 );
    var end = (size-1) + size * ( page - 1 )
    switch(sort){
        case 'date':
            var videoListKey ='iwara:'+site+':video:v2:list';
            redis.zrevrange(videoListKey, start, end).then((data)=>{
                if( data )
                    res.json(util.getReturnData(200, '获取最新视频数据成功', data))
                else
                    res.json(util.getReturnData(404, '获取最新视频数据失败'))
            })
            break;
        case 'like':
            var videoLikeKey ='iwara:'+site+':video:v2:like';
            redis.zrevrange(videoLikeKey, start, end).then((data)=>{
                if( data )
                    res.json(util.getReturnData(200, '获取最多喜欢视频数据成功', data))
                else
                    res.json(util.getReturnData(404, '获取最多喜欢视频数据失败'))
            })
            break;
        case 'watch':
            var videoWatchKey ='iwara:'+site+':video:v2:watch';
            redis.zrevrange(videoWatchKey, start, end).then((data)=>{
                if( data )
                    res.json(util.getReturnData(200, '获取最多观看视频数据成功', data))
                else
                    res.json(util.getReturnData(404, '获取最多观看视频数据失败'))
            })
            break;
        default:
            res.json(util.getReturnData(403, '错误的排序选项:'+sort))
            break;
    }
}

exports.user = (req, res) => {
    var site = req.params.site;
    
    var size = req.query.size?req.query.size:36;
    if( size <= 0 )size = 36
    var page = req.query.page?req.query.page:1;
    var start = 0 + size * ( page - 1 );
    var end = (size-1) + size * ( page - 1 )
    
    var author = encodeURI(req.params.author);
    var authorDataKey = 'iwara:'+site+':video:v2:user:'+author+':data';
    var authorKey = 'iwara:'+site+':video:v2:user:'+author;
    redis.get(authorDataKey).then((data)=>{
        if ( data ) {
            console.log('探针1')
            redis.zrevrange(authorKey, start, end).then((data2)=>{
                console.log('探针2')
                if ( data2 ){
                    data.videos = data2;
                    res.json(util.getReturnData(200, '获取用户数据成功', data))
                }
                else
                    res.json(util.getReturnData(404, '获取用户视频数据失败，用户:'+author))
            })
        } else {
            let tempData = {
                    "nickname":author,
                    "joinDate":"YYYY-MM-DD",
                    "description":"<strong>注意:该作者信息，用户爬虫并未收录到，但数据库中存该用户视频数据，因此将用户视频数据提供出来。该用户ID为："+author+"</strong>",
                    "picture":"",
                    "catchTime":Date.now(),
                    "id":author,
                    }
            //说明爬虫没有收录或者用户不存在
            redis.zrevrange(authorKey, start, end).then((data2)=>{
                console.log('探针2')
                if ( data2 && data2 != '' && data2 != null && data2 != undefined && data2.length != 0 ){
                    tempData.videos = data2;
                    res.json(util.getReturnData(200, '注意:该作者信息，用户爬虫并未收录到.但数据库中存该用户的视频数据，因此将用户视频数据提供出来。这可能会在未来弃用或者优化。该用户ID为：'+author, tempData));
                } else
                    res.json(util.getReturnData(404, '获取用户视频数据失败，用户:'+author))
            })
        }
    }).catch((err)=>{
        console.error(err);
    })
}

exports.tag = (req, res) => {
    var site = req.params.site;
    var tag = encodeURI(req.params.tag);
    if ( !site || (site != 'www' && site != 'ecchi'))res.json(util.getReturnData(403, '错误的站点选项:'+site))
    var size = req.query.size?req.query.size:36;
    if( size <= 0 )size = 36
    var page = req.query.page?req.query.page:1;
    var start = 0 + size * ( page - 1 );
    var end = (size-1) + size * ( page - 1 )
    var tagKey = 'iwara:'+site+':video:v2:tag:'+tag;
    redis.zrevrange(tagKey, start, end).then((data)=>{
        if( data )
            res.json(util.getReturnData(200, '获取标签数据成功', data))
        else
            res.json(util.getReturnData(404, '获取标签数据失败:'+req.params.tag))
    })
}

exports.purge = (req, res) => {
    var site = req.params.site;
    var id = req.params.id;
    
    console.log("Purge Video:"+site+'>>'+id)
    
    video(site, id, true).then((res)=>{
        console.log(res);
    })
    res.json(util.getReturnData(200, '正在开始爬取'+site+">>"+id));
}