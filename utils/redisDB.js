let redis = require("redis");
//获取到数据库的配置
const {redisConfig} = require("../config/db")
//获取redis连接
const redis_client = redis.createClient(redisConfig);
//连接成功
redis_client.on("connect", () => {
    console.log("连接成功")
})
//错误处理
redis_client.on("error", (err) => {
    console.log(err);
});
redis = {};

//根据模式获得全部键
keys = async (cursor, re, count) => {
    let getTempKeys = await new Promise((resolve) => {
        //从连接中获得到该值，并且返回
        redis_client.scan(cursor, "MATCH", re, "COUNT", count, (err, res) => {
            console.log(err)
            return resolve(res);
        });
    });
    return getTempKeys;
}
redis.scan = async (re, cursor = 0, count = 1000000) => {
    return await keys(cursor, re, count)
}

//set该值进入数据库
redis.set = (key, value) => {
    // 将所有对象转换为Json字符串进行保存
    // 需要注意的是如果该字符串过大，可能会导致性能下降
    value = JSON.stringify(value);
    return redis_client.set(key, value, (err) => {
        if (err) {
            console.log(err);
        }
    });
};
// 获得text，在get时可以使用then调用
text = async (key) => {
    let getTempValue = await new Promise((resolve) => {
        //从连接中获得到该值，并且返回
        redis_client.get(key, (err, res) => {
            return resolve(res);
        });
    });
    //将该值转化为本身的对象，并且返回
    getTempValue = JSON.parse(getTempValue)
    return getTempValue;
}
//返回获得的值
redis.get = async (key) => {
    return await text(key);
}


//设置key的过期时间
redis.expire = (key, ttl) => {
    redis_client.expire(key, parseInt(ttl))
}

//获取自增id
id = async (key) => {
    console.log("查找" + key)
    let id = await new Promise((resolve => {
        redis_client.incr(key, (err, res) => {
            console.log(res)
            return resolve(res)
        })
    }))
    console.log(id)
    return id
}
redis.incr = async (key) => {
    return await id(key)
}
//有序集合
//新增有序集合(键名，成员和分值)
redis.zadd = (key, member, num) => {
    member = JSON.stringify(member)
    redis_client.zadd(key, num, member, (err) => {
        if (err) {
            console.log(err)
        }
    })
}


redis.zrem = (key, member) => {
    member = JSON.stringify(member)
    redis_client.zrem(key, member,(err) => {
        if (err) {
            console.log(err)
        }
    })
}

//获取一定范围内的元素
tempData = async (key, min, max) => {
    let tData = await new Promise((resolve => {
        redis_client.zrevrange([key, min, max, 'WITHSCORES'], (err, res) => {
            return resolve(res)
        })
    }))
    //同时获得了分值，所以需要进行转化为对象
    let oData = []
    //构造
    for (let i = 0; i < tData.length; i = i + 2) {
        console.log(tData[i])
        oData.push({member: JSON.parse(tData[i]), score: tData[i + 1]})
    }
    return oData
}

redis.zrevrange = async (key, min = 0, max = -1) => {
    return tempData(key, min, max)
}

//有序集合的自增操作
redis.zincrby = (key, member, NUM = 1) => {
    member = JSON.stringify(member)
    redis_client.zincrby(key, NUM, member, (err) => {
        if (err) console.log(err)
    })
}

//有序集合通过member获取其score值
tempZscore = async (key, member) => {
    member = JSON.stringify(member)
    return await new Promise((resolve => {
        redis_client.zscore(key, member, (err, res) => {
            console.log(res)
            return resolve(res)
        })
    }))
}
redis.zscore = async (key, member) => {
    return tempZscore(key, member)
}

module.exports = redis;