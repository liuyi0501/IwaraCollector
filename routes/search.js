/* redis.set(Vkey, {
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
                        catchDate: data.catchDate?data.catchDate:"未知",
                        catchDateInt: data.catchDateInt?data.catchDateInt:"未知"
                    })
*/
/* {"uid":[]} */
var express = require('express');
var router = express.Router();
var ejs = require('ejs');
var fs = require("fs");
var axios = require("axios");
var redis = require("../utils/redisDB")
var async = require('async');

/* GET home page. */
router.get('/', (req,res) => {
    let cat = req.query.cat;
    
    let key = req.query.key
    
    let site = req.query.site ? req.query.site : "ecchi";
    
    let AllVideoKey = "iwara:" + site + ":video";
    
    let searchKey = "iwara:search";
    console.log(searchKey)
    if ( key ) {
        redis.zincrby(searchKey, key, 1);
        redis.zincrby(searchKey, 'searchNum', 1);
    }
    redis.zrevrange(searchKey, 0, 10).then( searchData => {
        
        if ( cat == "video" ) {
        redis.zrevrange(AllVideoKey, 0, -1).then(data => {
            let arr = [];
            let it = 0;
            // for ( j = 0 ; j < data.length ; j ++ ) {
            //     JSON.parse(json[i].member)
            //     if ( data[j].member.indexOf( key ) ) {
            //         arr.join(data[j]);
            //         it++;
            //     }
            //     if ( it > 100 ){
            //         break;
            //     }
            // }
            res.render('./search/index.ejs', {
                title: "Wobbay",
                cat: cat,
                data: data,
                key: key,
                site: site,
                searchData: searchData,
            });
        }).catch(err => {
            if ( err ){
                res.locals.message = err.message;
                res.locals.error = req.app.get('env') === 'development' ? err : {};
            
                // render the error page
                res.status(err.status || 500);
                res.render('error');
            }
        })
        } else if ( cat == "user" ){
            console.log(Date.now())
            if(decodeURIComponent(key)!=key){
                key = key;
            } else {
                key = encodeURIComponent(key);
            }
            redis.scan('iwara:'+site+':video:v2:user:*'+key+'*').then(data =>{
                //console.log(data, Date.now())
                res.render('./search/index.ejs', {
                    title: "Wobbay",
                    cat: cat,
                    data: data,
                    key: decodeURIComponent(key),
                    site: site,
                    searchData: searchData,
                });
            })
        } else {
        res.render('./search/index.ejs', {
                title: "Wobbay",
                cat: '',
                data: '',
                site: site,
                searchData:searchData,
            });
    }
    
    })
    
})

module.exports = router;