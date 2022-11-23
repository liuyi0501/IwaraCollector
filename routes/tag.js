var express = require('express');
var router = express.Router();

var {tag} = require('../controller/tag.js')

router.get('/', (req,res)=>{
    res.redirect(301, '/')
})

router.get('/:site/:tag', tag)

module.exports = router;