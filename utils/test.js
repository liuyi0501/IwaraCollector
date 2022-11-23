var redis = require('./redisDB');
console.log(Date.now())
    redis.scan('iwara:ecchi:video:v2:user:000*').then(data =>{
        console.log(data, Date.now())
    })


