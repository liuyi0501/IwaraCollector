var axios = require('axios')
var cheerio = require('cheerio');
var redis = require("../../utils/redisDB")

var getAuthor = async (site)=>{
    var authorListKey = 'iwara:'+site+':video:v2:userList';
    var authorList = await new Promise((resolve) => {
        redis.zrevrange(authorListKey, 0, -1).then((data)=>{
            resolve(data)
        })
    })
    catchAuthor(authorList, 0, site)
}

var catchAuthor = (authorList, i, site) => {
    if ( i >= authorList.length )return 0;
    var author = encodeURI(authorList[i].member);
    var url = 'https://ecchi.iwara.tv/users/'+authorList[i].member;
    console.log(url);
    var opt = {
        method: 'GET',
        header: {
            referer: 'https://www.iwara.tv/',
            accept: 'text/html',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
            cookie: 'has_js=1; _gid=GA1.2.2101679399.1659614575; _ga_PK7DE1RR8V=GS1.1.1659614575.1.1.1659614740.0; _ga=GA1.1.849307151.1659614575; __cf_bm=B6ELO2Mc5lKS_ffz2ZJ5RONeAKieSIllfeTscm7yPOw-1659614745-0-AcvzOM6yvDHxXOaQQsXaPtM5zzdeHD4qtNB9ryOJT8ID1kIQsvJzNaQEWOney4uTul7fHr8Cu4IZpABQy+3Tlj+KwaDI4SjyoL71rP7VWzyimtwTNNefbr+C+DPh73jQ7w=='
        },
        timeout: 0
    }
    axios.get(encodeURI(url), opt).then((response)=>{
        var data = response.data;
        var $ = cheerio.load(data);
        var nickname = $('span.field-content').find('h2').text();
        console.log('昵称为',nickname);
        
        var JoinDate = $('div.views-field-created').find('span.field-content').text();
        console.log('注册时间为',JoinDate);
        
        var description = $('.view-content').find('div.field-content').html();
        console.log('介绍为',description);
        
        var picture = $('.view-content').find('img').attr('src');
        console.log('头像为',picture);
        
        var catchTime = Date.now();
        var json = {
            nickname: nickname,
            joinDate: JoinDate,
            description: description,
            picture: picture,
            catchTime: catchTime,
            id: authorList[i].member
        }
        
        var authorDataKey = 'iwara:'+site+':video:v2:user:'+author+':data';
        console.log('authorDataKey',authorDataKey)
        redis.set(authorDataKey, json)
        
        catchAuthor(authorList, ++i, site)
    }).catch((err)=>{
        console.log(err)
        catchAuthor(authorList, ++i, site)
    })
}

exports.getAuthor = getAuthor;
//catchAuthor([{member: '相位土豆'}], 0, 'ecchi')