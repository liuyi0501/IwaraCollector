var express = require('express');
var router = express.Router();
var fs = require('fs');

var envVersion = 2;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('<script>window.location.replace("/");</script>');
});
router.get('/:siteType/:uid', function(req, res, next) {

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
    var siteType = req.params.siteType;
    var uid = req.params.uid;
    var uidOld = uid;
    var debug = req.query.debug?req.query.debug:0;
    var page = req.query.p?req.query.p:0;
    console.log('Get user ',uid,' page ',page);
    if ( debug ){
        
    }else if ( envVersion == 1){
    fs.exists('./data/author/'+siteType+'/users/'+uid+'_'+page+'.json',(exist)=>{
        if(exist){
            fs.readFile('./data/author/'+siteType+'/users/'+uid+'_'+page+'.json','utf8',function(err,data){
                if(err){
                    console.log(err);
                    if ( req.query.encode != 1 )
                        next( { message: "Read user data failed : " + uid + "_" + page } )
                    else{
                        res.redirect(302, '/users/'+siteType+'/'+uid+'?encode=1');
                    }
                }else{
                    var json = JSON.parse(data);
                    res.render('users.ejs',{
                        nickname:json.nickname,
                        picture: json.picture,
                        description: json.description,
                        title: json.title,
                        video: json.video,
                        thumb: json.thumb,
                        allpage: json.allpage,
                        JoinDate: json.JoinDate,
                        header: header,
                        footer: footer,
                        siteType: siteType,
                        uid: uid,
                        catchDate: json.catchDate,
                        catchDateInt: json.catchDateInt
                    })
                }
            })
        }else{
            next( { message: "user data not found : " + uid + "_" + page } )
        }
    })
    } else if (envVersion == 2){
        
        res.render('users.ejs',{
            nickname:'loading',
            picture: 'loading',
            description: 'loading',
            title: uid,
            video: 'loading',
            thumb: 'loading',
            allpage: 0,
            JoinDate: 'loading',
            header: header,
            footer: footer,
            siteType: siteType,
            uid: uid,
            catchDate: 'loading',
            catchDateInt: 0,
            page: page,
            envVersion:2,
                    })
    }
});

module.exports = router;
