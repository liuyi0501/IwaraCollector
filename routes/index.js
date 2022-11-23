var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var fs = require("fs");
var axios = require("axios");
var redis = require("../utils/redisDB")
var async = require('async');

var envVersion = 2;

/* GET home page. */
router.get('/about', (req,res) => {
    res.render('./about.ejs', {
        title: "Wobbay",
    });
})

router.get('/rank', (req,res) => {
    
    let site = req.query.site?req.query.site:"ecchi";
    
    let now = Date.now();
    
    let d = new Date();
    
    var timeStr = d.getFullYear() +  "-" + Number(d.getMonth() + 1) + '-' + d.getDate();
    var timeStr_mon = d.getFullYear() +  "-" + Number(d.getMonth() + 1);
    var timeStr_yr = d.getFullYear();
    
    var rank = ""
    if(!req.query.rank){
        rank = "daily"
    } else {
        rank = req.query.rank;
    }
    
    let Key = 'iwara:rank:'+ site;
    if(rank == "daily")
        Key = Key + ":daily:" + timeStr
    else if (rank == "month")
        Key = Key + ":month:" + timeStr_mon
    else if (rank == "year")
        Key = Key + ":year:" + timeStr_yr
    redis.zrevrange(Key, 0, 100).then( (data) => {
        console.log("Key: ",Key)
        //console.log("data", data);
        async.mapLimit(data, 100, function(item,callback) {
            let Vkey = "iwara:"+site+":"+item.member
            console.log("请求key： ",Vkey)
            redis.get(Vkey).then((result) => {
                console.log("结果： ",result)
                if(result){
                    callback(null, {
                        title: result.V_title,
                        thumb: result.thumb,
                        id: result.V_id,
                        score: item.score
                    })
                } else {
                    console.log("数据库无result")
                    fs.exists("../data/"+site+"/"+id+".json", (exist) =>{
                        if(exist){
                            callback(null, {
                                title: item.member,
                                thumb: null,
                                id: item.member,
                                score:item.score
                            })
                        } else {
                            callback(null, {
                                title: item.member,
                                thumb: null,
                                id: "<",//这里是因为前端检测id中是否含有 < 来筛去 <a href=" 所以这里直接写 < 可以省去再次检测的步骤。
                                score:item.score
                            })
                        }
                    })
                }
            })
            
        }, function(err, result) {
            console.log('async.map result:',result)
            res.render('rank.ejs', {
                title: "Wobbay",
                data: result,
                site: site,
                rank: rank,
                baseUrl: req.protocol+"://"+req.hostname+req.originalUrl,
            });
        })
    })
    
    
})

router.get('/referer', (req,res) => {
    let key = 'iwara:referer';
    let domainKey = 'iwara:referer:domain';
    redis.zrevrange(key, 0, -1).then((data1) => {
        redis.zrevrange(domainKey, 0, -1).then((data2) => {
            res.render('referer', {
                referer:data1,
                domain:data2
            })
        })
    })
})

router.get('/', function(req, res, next) {
    var header = fs.readFileSync("./config/header.html",function(err){
    if(err){
        console.error(err);
        return "";
    }
    })
    var footer = fs.readFileSync("./config/footer.html",function(err){
    if(err){
        console.error(err);
        return "";
    }
    })
    res.render('index.ejs', { 
                    title: 'Wobbay',
                    a: ["a","b","c","d"],
                    header: header,
                    footer: footer
                    });
});

router.get('/proxy', function(req, res, next) {
    res.send("请挂梯子。 Windows用户自我修改 hosts 文件， 加入： 66.206.15.50 i.iwara.tv 到hosts文件末尾<br/>安卓用户没办法，加载图片看脸，可以试试换移动数据")
});


router.get('/:site/api', function(req, res, next) {
    var site = req.params.site;
    url = req.query.url;
    var start_line = url.indexOf('/video/');
    var id = "";
    for (i = 0; i < url.length; i++) {//获取视频的17位ID
        if (i >= start_line + 7) {
                id = id + url[i];
            }
        }
    if (id.indexOf('?language=ja') != -1) {
            id.replace(/\?language=ja/g, '')
        }
    fs.exists("./data/"+site+"/api/"+id+".json",function(exist){
        if(exist){
            fs.readFile("./data/"+site+"/api/"+id+".json","utf8",function(err,data){
                if(err){
                    console.error(err);
                    res.status("500");
                }
                try{
                json = JSON.parse(data)
                } catch{
                    console.log(data)
                }
                if(Number(json.time) + 21600000 <= Number(Date.now())){
                    console.log("API缓存过期")
                    axios.get(url,{
                        header:{
                        "referer":"https://"+site+".iwara.tv/",
                        "origin":"https://"+site+".iwara.tv/"
                        },
                        timeout: 0
                    }).then((response)=>{
                        if(typeof(response.data) != 'object' ||typeof(response.data) == 'undefined'){
                            console.log(typeof(response.data));
                            res.json([{"resolution":"获取失败，请刷新网页","uri":"//iwara.wobbay.xyz/video/fail.mp4"}])
                        }else{
                            data = response.data;
                            now = Number(Date.now());
                            console.log("更新API缓存")
                            fs.writeFile("./data/"+site+"/api/"+id+".json",'{"time":"'+now+'","data":'+JSON.stringify(data)+'}',function(err){
                                if(err)console.error(err)
                            })
                            res.json(data)
                        }
                    }).catch(function (error) {
                if (error.response) {
                  // The request was made and the server responded with a status code
                  // that falls out of the range of 2xx
                  console.log(error.response.data);
                  console.log(error.response.status);
                  console.log(error.response.headers);
                } else if (error.request) {
                  // The request was made but no response was received
                  // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                  // http.ClientRequest in node.js
                  console.log(error.request);
                } else {
                  // Something happened in setting up the request that triggered an Error
                  console.log('Error', error.message);
                }
                console.log(error.config);
                console.log("Get API error")
                    //console.error(err.stack);
                res.json(
                    [{"resolution":"获取失败，请刷新网页","uri":"https://iwara.wobbay.xyz/video/fail.mp4"}])
            });
                }else{
                    console.log("缓存命中")
                res.json(json.data)
                }
            })
        }else{
            console.log("API未缓存")
            axios.get(url,{
                header:{
                "referer":"https://"+site+".iwara.tv/",
                "origin":"https://"+site+".iwara.tv/"
                },
                timeout: 1000
            },function(err){
                if(err){
                    console.log("Get API error")
                    //console.error(err.stack);
                    res.json('[{"uri":"NULL","resolution":"获取失败，请刷新网页"}]')
                }
            }).then((response)=>{
                if(typeof(response.data) != 'object' || typeof(response.data) == 'undefined'){
                    console.log(typeof(response.data))
                    res.json([{"resolution":"获取失败，请刷新网页","uri":"https://iwara.wobbay.xyz/video/fail.mp4"}])
                }else{
                    data = response.data;
                    now = Number(Date.now());
                    fs.writeFile("./data/"+site+"/api/"+id+".json",'{"time":"'+now+'","data":'+JSON.stringify(data)+'}',function(err){
                        if(err)console.error(err)
                    })
                res.json(data)
                }
            }).catch(function (error) {
                if (error.response) {
                  // The request was made and the server responded with a status code
                  // that falls out of the range of 2xx
                  console.log(error.response.data);
                  console.log(error.response.status);
                  console.log(error.response.headers);
                } else if (error.request) {
                  // The request was made but no response was received
                  // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                  // http.ClientRequest in node.js
                  console.log(error.request);
                } else {
                  // Something happened in setting up the request that triggered an Error
                  console.log('Error', error.message);
                }
                console.log(error.config);
                console.log("Get API error")
                    //console.error(err.stack);
                res.json(
                    [{"resolution":"获取失败，请刷新网页","uri":"https://iwara.wobbay.xyz/video/fail.mp4"}])
            });
            
        }
    })

})
    

router.get('/:site/video/:id/redirect*', function(req,res) {
    var site = req.params.site;
    var id = req.params.id;
    var resolution = req.query.resolution;
    axios.get("http://localhost:3001/"+site+"/api?url=https://ecchi.iwara.tv/api/video/"+id).then(response =>{
            console.log(resolution);
            if(resolution){
                let uri;
                let json = response.data;
                console.log(resolution);
                for ( i = 0 ; i < json.length ; i++ ){
                    console.log(resolution, json[i].resolution)
                    if (json[i].resolution == resolution){
                        uri = json[i].uri;
                        console.log(resolution, json[i].uri);
                    }
                }
                if (!uri){
                    uri = json[0].uri
                }
                res.redirect(302, 'https://redirect.wobbay.xyz/https:'+uri)
            } else {
                let json = response.data;
                let uri = json[0].uri
                res.redirect(302, 'https://redirect.wobbay.xyz/https:'+uri)
            }
    })
})

router.get('/:site/video/:id', function(req, res, next) {
    let routePath = req.url;
    //res.send(req.url);
    let is_redirect = routePath.indexOf('redirect')
    let is_p3f = routePath;
    if(is_redirect != -1 && is_p3f.indexOf('?') != -1){
        res.redirect(302, '/'+req.params.site+'/video/'+req.params.id+'/redirect.mp4')
        return 0;
    }
    
    var debug = req.query.debug?req.query.debug:0;
    debug?debug:0;
    
    var site = req.params.site;
    
    let now = Date.now();
    
    let d = new Date();
    
    var timeStr = d.getFullYear() +  "-" + Number(d.getMonth() + 1) + '-' + d.getDate();
    
    let watchDailyKey = 'iwara:rank:'+ site +':daily:'+ timeStr
    console.log(watchDailyKey)
    redis.zincrby(watchDailyKey, req.params.id, 1);
    
    var timeStr_mon = d.getFullYear() +  "-" + Number(d.getMonth() + 1);
    
    let watchMonthKey = 'iwara:rank:'+ site +':month:'+timeStr_mon
    console.log(watchMonthKey)
    redis.zincrby(watchMonthKey, req.params.id, 1);
    
    var timeStr_yr = d.getFullYear();
    
    let watchYearKey = 'iwara:rank:'+ site +':year:'+timeStr_yr
    console.log(watchYearKey)
    redis.zincrby(watchYearKey, req.params.id, 1);
    
    console.log('增加一次PV')
    
    
    
    var header = fs.readFileSync("./config/header.html",function(err){
    if(err){
        console.error(err);
        return "";
    }
    })
    var footer = fs.readFileSync("./config/footer.html",function(err){
    if(err){
        console.error(err);
        return "";
    }
    })
    id = req.params.id;
    console.log(req.params.id);
    console.log(envVersion);
    if(!id){
        res.render('video.ejs', { 
            title: 'Wobbay',
            siteType: site,
            V_title: "NULL",
            thumb: "NULL",
            author: "NULL",
            description: "NULL",
            origin: "NULL",
            download: "NULL",
            header: header,
            footer: footer,
            time: "NULL",
            author_url:'NULL',
            author_picture: 'NULL',
            baseUrl: req.protocol+"://"+req.hostname+req.originalUrl,
            debug: debug,
            envVersion:1,
        });
    }else{
        if(debug){
            
        }else if(envVersion == 1){
            fs.readFile("./data/"+site+"/"+id+".json",'utf8',function(err,data){
                if(err){
                    /*
                    console.error(err)
                    if(id.indexOf('?') == -1)
                        res.redirect(302, '/'+site+'/video/'+id+'%3F')
                    else
                        res.render('video.ejs', { 
                            siteType: site,
                            V_title: 'V_title',
                            thumb: 'thumb',
                            author: "Jdata['author'].name",
                            description: 'description',
                            origin: 'origin',
                            video: 'Pdata',
                            download: 'download',
                            header: header,
                            footer: footer,
                            V_id: id,
                            time: 'Jdata.postDate',
                            author_url:'Jdata["author"].url',
                            author_picture: 'Jdata["author"].picture',
                            catchDate: 'Jdata.catchDate?Jdata.catchDate:"未知"',
                            catchDateInt: 'Jdata.catchDateInt?Jdata.catchDateInt:"未知"'
            });*/
                }else{
                    axios.get("http://localhost:3001/"+site+"/api?url=https://ecchi.iwara.tv/api/video/"+id).then(response =>{
                        
                        
                        
                        
                        
                        
                        Pdata = response.data;
                        Jdata = JSON.parse(data.trim());
                        
                        let AllVideoKey = "iwara:" + site + ":video";
                        
                        var t1 = new Date(Jdata.postDate).getTime();
                        
                        redis.zincrby(AllVideoKey, JSON.stringify({
                            title: Jdata.title,
                            thumb: Jdata.thumb,
                            vid: id
                        }), t1);
                        
                        
                        V_title = Jdata.title;
                        thumb = Jdata.thumb;
                        author = Jdata.author;
                        description = Jdata.description;
                        origin = Jdata.origin;
                        download = Jdata.download;
                        if(!download){
                            download="NULL";
                        }
                        let Vkey = "iwara:"+site+":"+id;
                        redis.set(Vkey, {
                            siteType: site,
                            V_title: V_title,
                            thumb: thumb,
                            author: Jdata['author'].name,
                            description: description,
                            origin: origin,
                            video: Pdata,
                            V_id: id,
                            time: Jdata.postDate,
                            author_url:Jdata["author"].url,
                            author_picture: Jdata["author"].picture,
                            catchDate: Jdata.catchDate?Jdata.catchDate:"未知",
                            catchDateInt: Jdata.catchDateInt?Jdata.catchDateInt:"未知"
                        })
                        res.render('video.ejs', { 
                            title: 'Wobbay',
                            siteType: site,
                            V_title: V_title,
                            thumb: thumb,
                            author: Jdata['author'].name,
                            description: description,
                            origin: origin,
                            download: download,
                            video: Pdata,
                            header: header,
                            footer: footer,
                            V_id: id,
                            time: Jdata.postDate,
                            author_url:Jdata["author"].url,
                            author_picture: Jdata["author"].picture,
                            catchDate: Jdata.catchDate?Jdata.catchDate:"未知",
                            catchDateInt: Jdata.catchDateInt?Jdata.catchDateInt:"未知",
                            baseUrl: req.protocol+"://"+req.hostname+req.originalUrl,
                            debug: debug,
                            envVersion:1,
                        });
                    })
                    
                }
                
            })
        } else if (envVersion == 2) {
            res.render('video.ejs', { 
                title: 'Wobbay',
                siteType: site,
                V_title: 'Loading',
                thumb: '',
                author: 'Loading',
                description: 'Loading',
                origin: 'Loading',
                download: 'Loading',
                video: 'Loading',
                header: header,
                footer: footer,
                V_id: id,
                time: 'Loading',
                author_url:'Loading',
                author_picture: 'Loading',
                catchDate: 'Loading',
                catchDateInt: 'Loading',
                baseUrl: req.protocol+"://"+req.hostname+req.originalUrl,
                debug: debug,
                envVersion:2,
            });
        }
    }
}
);

router.get('/:site/page', function(req, res, next) {
    var site = req.params.site;
    var debug = req.query.debug?req.query.debug:0;
    var pageAll = fs.readFileSync("./data/"+site+"/page/all.json",function(err){
        if(err){
            console.log(err);
        }
    })
    var lastpage = JSON.parse(pageAll)["LastPage"];
    var header = fs.readFileSync("./config/header.html",function(err){
    if(err){
        console.error(err);
        return "";
    }
    })
    var footer = fs.readFileSync("./config/footer.html",function(err){
    if(err){
        console.error(err);
        return "";
    }
    })
    if(req.query.p < 0){
        res.send("Wrong Page Number")
        }
    if(!req.query.p||req.query == "0"){
        page = 1;
    }else{
        page = req.query.p ;
    }
    if (debug){
        
    } else if (envVersion == 1){
    fs.readFile("./data/"+site+"/page/"+String(Number(page)-1)+".json",'utf8',function(err,data){
        if(err){
            console.error(err)
            res.send("Error Occour While Reading File "+ page+".json . \n Please tell to the admin admin@wobbay.xyz");
        }else{
            Jdata = JSON.parse(data.trim())
            title = Jdata.title;
            thumb = Jdata.thumb;
            video = Jdata.video;
            res.render('page.ejs', { 
                title: 'Wobbay',
                page: page,
                siteType: site,
                thumb: thumb,
                video: video,
                V_title: title,
                sort: "date",
                lastpage: lastpage,
                header: header,
                footer: footer,
                baseUrl: req.protocol+"://"+req.hostname+req.originalUrl,
                debug: debug
                })
        }
    })
    } else if (envVersion == 2){
        res.render('page.ejs', { 
                title: 'Wobbay',
                page: page,
                siteType: site,
                thumb: 'thumb',
                video: 'video',
                V_title: 'title',
                sort: "date",
                lastpage: lastpage,
                header: header,
                footer: footer,
                baseUrl: req.protocol+"://"+req.hostname+req.originalUrl,
                debug: debug,
                envVersion:2,
        })
    }

});

router.get('/:site/like', function(req, res, next) {
    var debug = req.query.debug?req.query.debug:0;
    var site = req.params.site;
    var pageAll = fs.readFileSync("./data/"+site+"/page/all.json",function(err){
        if(err){
            console.log(err);
        }
    })
    var lastpage = JSON.parse(pageAll)["LastPage"];
    var header = fs.readFileSync("./config/header.html",function(err){
    if(err){
        console.error(err);
        return "";
    }
    })
    var footer = fs.readFileSync("./config/footer.html",function(err){
    if(err){
        console.error(err);
        return "";
    }
        
    })
    if(req.query.p < 0){
        res.send("Wrong Page Number")
        }
    if(!req.query.p||req.query == "0"){
        page = 1;
    }else{
        page = req.query.p ;
    }
    if (debug){
        
    } else if(envVersion == 1){
    fs.readFile("./data/"+site+"/like/"+String(Number(page)-1)+".json",'utf8',function(err,data){
        if(err){
            console.error(err)
            res.send("Error Occour While Reading File "+ page+".json . \n Please tell to the admin admin@wobbay.xyz");
        }else{
            Jdata = JSON.parse(data.trim())
            title = Jdata.title;
            thumb = Jdata.thumb;
            video = Jdata.video;
            res.render('page.ejs', { 
                title: 'Wobbay',
                page: page,
                siteType: site,
                thumb: thumb,
                video: video,
                V_title: title,
                sort: "like",
                lastpage: lastpage,
                header: header,
                footer: footer
                });
        }
    })
    } else if (envVersion == 2){
        res.render('page.ejs', { 
                title: 'Wobbay',
                page: page,
                siteType: site,
                thumb: '',
                video: '',
                V_title: '',
                sort: "like",
                lastpage: lastpage,
                header: header,
                footer: footer,
                baseUrl: req.protocol+"://"+req.hostname+req.originalUrl,
                debug: debug,
                envVersion:2,
        })
    }
});


router.get('/:site/frame-video/:id', function(req, res, next) {
    var site = req.params.site;
    id = req.params.id;
    console.log(req.params.id);
    if(id == ""){
        res.render('frame-video.ejs', { 
            title: 'Wobbay',
            siteType: site,
            V_title: "NULL",
            thumb: "NULL",
            author: "NULL",
            description: "NULL",
            time: "NULL",
            author_url:"NULL",
            author_picture: "NULL"
        });
    }else{
        fs.readFile("./data/"+site+"/"+id+".json",'utf8',function(err,data){
            if(err){
                console.error(err)
                res.send("Error Occour While Reading File "+ id +".json . \n Maybe caused this File is not exist.\nPlease tell to the admin admin@wobbay.xyz");
            }else{
                axios.get("http://localhost:3001/"+site+"/api?url=https://ecchi.iwara.tv/api/video/"+id).then(response =>{
                    Pdata = response.data;
                    Jdata = JSON.parse(data.trim());
                    V_title = Jdata.title;
                    thumb = Jdata.thumb;
                    author = Jdata.author;
                    description = Jdata.description;
                    res.render('frame-video.ejs', { 
                        title: 'Wobbay',
                        siteType: site,
                        V_title: V_title,
                        thumb: thumb,
                        author: Jdata['author'].name,
                        description: description,
                        video: Pdata,
                        time: Jdata.postDate,
                        author_url:Jdata["author"].url,
                        author_picture: Jdata["author"].picture
                    });
                })
                
            }
            
        })
    }
}
);



module.exports = router;
