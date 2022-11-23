var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var ejs = require('ejs');
var compression = require("compression");
var fs = require("fs");

var redis = require("./utils/redisDB")

var updateData = require('./utils/updateData')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var searchRouter = require('./routes/search');
var apiRouter = require('./routes/api');
var tagRouter = require('./routes/tag');


var app = express();
// view engine setup
app.all("*", function (req, res, next) {
    let referer = req.headers["referer"] || req.headers["referered"];
    if(req.headers["referer"] || req.headers["referered"]){
        let key = 'iwara:referer';
        
        var pattern = /(http|https):\/\/(www.)?(\w+(\.)?)+/g;
        let domainKey = 'iwara:referer:domain';
        redis.zincrby(key, req.headers["referer"] || req.headers["referered"])
        redis.zincrby(domainKey, referer.match(pattern)[0])
    }
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin", '*');
  // //允许的header类型
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  // //跨域允许的请求方式 
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  // 可以带cookies
  res.header("Access-Control-Allow-Credentials", true);
  if(req.header["referer"]){
      console.log(req.header["referer"])
      fs.writeFile("./log/referer.log",req.header["referer"]+"\n","a",function(err){
          if(err){
              console.log(err);
          }
      })
  }
  
  

  
  
  if (req.method == 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
})


process.on('uncaughtException', (e)=>{
    now = Date.now();
    fs.writeFileSync('./log/err_'+now+'.log',e.name+": "+e.message+"\n-----\n"+e.stack,function(err){
        if(err)console.log(err);
    });
    console.error('process error is:', e.message,'\n',e.stack);
});
process.on('unhandledRejection',function(err,promise){
    let e = err
    fs.writeFileSync('./log/err-promise_'+Date.now()+'.log',e.name+": "+e.message+"\n-----\n"+e.cause+"\n---\n---\n"+promise,function(err){
        if(err)console.log(err);
    });
    console.error('process error is:', e.message);
    console.error('promise error is:', promise);
})


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(compression({
    filter:shouldCompress
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'doc')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use("/search", searchRouter);
app.use("/api", apiRouter);
app.use("/tag", tagRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

function shouldCompress(req,res){
    if(req.headers['x-no-compression']){
        return false
    }
    return compression.filter(req,res)
}



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3001);

module.exports = app;
