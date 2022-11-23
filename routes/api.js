var express = require('express');
var router = express.Router();
var {index, video, sort, user, videos, tag, purge} = require('../controller/api.v2.js')
var update = require('../utils/updateData');

router.get('/', index);

router.get('/update', (req, res)=>{
    update();
    res.send('update has begin');
})

router.get('/video/:site/list.json', videos)

router.get('/video/:site/:id', video)

router.get('/videos/:site/:sort', sort)

router.get('/user/:site/:author', user)

router.get('/tag/:site/:tag', tag)

router.get('/purge/video/:site/:id', purge)

module.exports = router;