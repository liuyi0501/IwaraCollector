const util = require('../utils/common')
const redis = require('../utils/redisDB');

var envVersion = 2;

exports.tag = (req,res)=>{
    var site = req.params.site;
    var tag = req.params.tag;
    var debug = req.query.debug?req.query.debug:0;
    var page = req.query.page?req.query.page:1;
    res.render('tag.ejs', {
        page: page,
        siteType: site,
        envVersion: envVersion,
        tag: tag,
        debug:debug
    })
    
}