var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var fs = require("fs");
var axios = require("axios");
/* GET home page. */



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


router.get('/api', function(req, res, next) {
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
    fs.exists("./data/ecchi/api/"+id+".json",function(exist){
        if(exist){
            fs.readFile("./data/ecchi/api/"+id+".json","utf8",function(err,data){
                if(err){
                    console.error(err);
                    res.status("500");
                }
                json = JSON.parse(data)
                if(Number(json.time) + 21600000 <= Number(Date.now())){
                    console.log("API缓存过期")
                    axios.get(url,{
                        header:{
                        "referer":"https://ecchi.iwara.tv/",
                        "origin":"https://ecchi.iwara.tv/"
                        },
                        timeout: 1000
                    }).then((response)=>{
                        data = response.data;
                        now = Number(Date.now());
                        console.log("更新API缓存")
                        fs.writeFile("./data/ecchi/api/"+id+".json",'{"time":"'+now+'","data":'+JSON.stringify(data)+'}',function(err){
                            if(err)console.error(err)
                        })
                        res.json(data)
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
                    [{"resolution":"Source","uri":"https://iwara.wobbay.xyz/video/fail.mp4"},
                    {"resolution":"540p","uri":"https://iwara.wobbay.xyz/video/fail.mp4"},
                    {"resolution":"360p","uri":"https://iwara.wobbay.xyz/video/fail.mp4"}])
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
                "referer":"https://ecchi.iwara.tv/",
                "origin":"https://ecchi.iwara.tv/"
                },
                timeout: 1000
            },function(err){
                if(err){
                    console.log("Get API error")
                    //console.error(err.stack);
                    res.json('[{"uri":"NULL"},{},{}]')
                }
            }).then((response)=>{
                data = response.data;
                now = Number(Date.now());
                fs.writeFile("./data/ecchi/api/"+id+".json",'{"time":"'+now+'","data":'+JSON.stringify(data)+'}',function(err){
                if(err)console.error(err)
            })
            res.json(data)
        
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
                    [{"resolution":"Source","uri":"https://iwara.wobbay.xyz/video/fail.mp4"},
                    {"resolution":"540p","uri":"https://iwara.wobbay.xyz/video/fail.mp4"},
                    {"resolution":"360p","uri":"https://iwara.wobbay.xyz/video/fail.mp4"}])
            });
            
        }
    })

})
    



router.get('/video/:id', function(req, res, next) {
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
    if(!id){
        res.render('video.ejs', { 
            title: 'Wobbay',
            siteType: "ecchi",
            V_title: "NULL",
            thumb: "NULL",
            author: "NULL",
            description: "NULL",
            origin: "NULL",
            download: "NULL",
            header: header,
            footer: footer
        });
    }else{
        fs.readFile("./data/ecchi/"+id+".json",'utf8',function(err,data){
            if(err){
                console.error(err)
                res.send("Error Occour While Reading File "+ id +".json . \n Maybe caused this File is not exist.\nPlease tell to the admin admin@wobbay.xyz");
            }else{
                axios.get("http://66.42.108.246:3001/api?url=https://ecchi.iwara.tv/api/video/"+id).then(response =>{
                    Pdata = response.data;
                    Jdata = JSON.parse(data.trim());
                    V_title = Jdata.title;
                    thumb = Jdata.thumb;
                    author = Jdata.author;
                    description = Jdata.description;
                    origin = Jdata.origin;
                    download = Jdata.download;
                    if(!download){
                        download="NULL";
                    }
                    res.render('video.ejs', { 
                        title: 'Wobbay',
                        siteType: "ecchi",
                        V_title: V_title,
                        thumb: thumb,
                        author: author,
                        description: description,
                        origin: origin,
                        download: download,
                        video: Pdata,
                        header: header,
                        footer: footer
                    });
                })
                
            }
            
        })
    }
}
);

router.get('/page', function(req, res, next) {
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
    fs.readFile("./data/ecchi/page/"+String(Number(page)-1)+".json",'utf8',function(err,data){
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
                siteType: "ecchi",
                thumb: thumb,
                video: video,
                V_title: title,
                sort: "date",
                header: header,
                footer: footer
                });
        }
    })

});

router.get('/like', function(req, res, next) {
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
    fs.readFile("./data/ecchi/like/"+String(Number(page)-1)+".json",'utf8',function(err,data){
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
                siteType: "ecchi",
                thumb: thumb,
                video: video,
                V_title: title,
                sort: "like",
                header: header,
                footer: footer
                });
        }
    })

});

module.exports = router;
