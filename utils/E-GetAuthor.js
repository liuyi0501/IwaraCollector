var fs = require('fs');
var axios = require('axios');
var cheerio = require('cheerio');

fileList = [];
userList = [];

const iwara = axios.create({
  baseURL: 'https://ecchi.iwara.tv/users/',
  timeout: 2000,
  headers: {
      Host: 'ecchi.iwara.tv',
      'X-Custom-Header': 'foobar',
      Referer: 'https://ecchi.iwara.tv/users/',
      'cache-control': 'max-age=0',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36'
  }
});


/* 用于读取文件列表 */
function makeIndex(){
    var path = './data/author/ecchi/index/'
    var dirList = fs.readdirSync(path);
	dirList.forEach(function(item) {
		if (fs.statSync(path + '\/'+ item).isDirectory()) {
			walk(path + '\/' + item);
		} else {
			fileList.push(path + item);
		}
	});
	console.log("读取目录完成")
	GetUserList();
}

/* 用于获取用户uid */
function GetUserList(){
    if(!fileList){
        throw "Empty File List";
    }
    fileList.forEach((item)=>{
        item = item.replace('./data/author/ecchi/index/','')
        userList.push(item.replace('.json',''))
    })
    UserDB = {
        uid: userList
    }
    fs.writeFileSync('./data/author/ecchi/list.json',JSON.stringify(UserDB),(err)=>{
        if(err){
            console.log(err);
        }
    })
    console.log(UserDB);
    console.log("读取用户ID完成");
    GetUser(0);
}

/* 存储用户数据 */
function saveUser(uid,nickname,picture,title,video,thumb,page,allpage,description,JoinDate){
    //uid 是该用户的唯一id
    //video 是 该作者的所有视频链接
    console.log('存储用户',uid,'第',page,'页');
    let d = new Date();
    let timeStr = d.getFullYear() +  "-" + Number(d.getMonth() + 1) + '-' + d.getDate();
    fs.writeFileSync('./data/author/ecchi/users/'+uid+'_'+page+'.json',JSON.stringify({
        nickname: nickname,
        picture: picture,
        description: description,
        title: title,
        video: video,
        thumb: thumb,
        allpage: allpage,
        JoinDate: JoinDate,
        catchDate: timeStr,
        catchDateInt: d
    }),(err)=>{
        if(err)console.log(err)
    })
}
/* 爬取用户信息 */
function GetUser(num,tryNum){
    var uid = userList[num];
    iwara.get(uid).then((res)=>{
        console.log('------------');
        console.log('爬取用户',uid);
        var data = res.data;
        var $ = cheerio.load(data);
        var nickname = $('span.field-content').find('h2').text();
        console.log('昵称为',nickname);
        var JoinDate = $('div.views-field-created').find('span.field-content').text();
        console.log('注册时间为',JoinDate);
        var description = $('.view-content').find('div.field-content').text();
        console.log('介绍为',description);
        var picture = $('.view-content').find('img').attr('src');
        console.log('头像为',picture);
        GetUserVideo(num,uid,picture,0,nickname,JoinDate,description,0);//GetUserVideo(num,uid,picture,page,nickname,JoinDate,description,allpage)
    }).catch((err)=>{
        if(tryNum>=3){
            console.log('用户',uid,'或许不存在。已在请求三次失败后跳过')
            GetUser(String(Number(num)+1));
        }else{
            if(!tryNum || typeof(tryNum) == 'undefined'){
                tryNum = 0;
            }
            console.log(tryNum);
            console.log(err.stack)
            console.log("Error At GetUser")
            GetUser(num,++tryNum);
        }
    })
    
}
function GetUserVideo(num,uid,picture,page,nickname,JoinDate,description,allpage){
    iwara.get(encodeURIComponent(nickname)+'/videos?page='+page).then((res)=>{
        var data = res.data;
        var $ = cheerio.load(data);
        let video = []
        let thumb = []
        let title = []
        $('h3.title').each(function (i, ele) {
            video.push($(this).find('a').attr('href'))//获取视频标题的链接
            title.push($(this).find('a').text())//获取视频标题
        })
        $('.field-items').each(function (i, ele) {
            thumb.push($(this).find('img').attr('src'))//获取视频图片
        })
        if(allpage==0){
            var lastpageLink = $('li.pager-last').find('a').attr('href');
            var b = 0;
            if(lastpageLink){
                b = '';
                var start_line = lastpageLink.indexOf('page=');
                for(var i = start_line + 5; i<lastpageLink.length; i++){
                    b = b + lastpageLink[i];
                }
            }
            var lastpage = lastpageLink?Number(b):0;
        }else{
            var lastpage = allpage;
        }
        console.log('该用户共计',lastpage,'页')
        // if(lastpageLink){
        //     var re = lastpageLink.match(/[0-9]+/g)
        //     console.log(re);
        //     console.log(lastpageLink)
        //     lastpage = re[re.length]
        // }else{
        //     lastpage = 0;
        // }
        //if(lastpageLink)lastpage = lastpageLink.substring(lastpageLink.indexOf('page=')+5,lastpageLink.length);
        //else lastpage = 0;
        saveUser(uid,nickname,picture,title,video,thumb,page,lastpage,description,JoinDate)//saveUser(uid,nickname,picture,title,video,thumb,page,allpage,description,JoinDate)
        if(lastpage > page){//当存在最后一页时且最后一页大于当前页码
            console.log('当前num为',num)
            GetUserVideo(num,uid,picture,++page,nickname,JoinDate,description,lastpage)//GetUserVideo(num,uid,picture,page,nickname,JoinDate,description,allpage)
        }else{
            console.log('当前num为',num)
            if(Number(num)+1 < userList.length)GetUser(++num);//记录完当前用户后，记录下一用户
            else {
                console.log('全部',userList.length,'均爬取完毕')
                console.log('当前num为',num)
            }
        }
    }).catch((err)=>{
        console.log(err.stack)
        console.log(encodeURIComponent(nickname)+"/videos")
        console.log("Error At GetUser")
        GetUserVideo(num,uid,picture,page,nickname,JoinDate,description,allpage);
        
       })
}

makeIndex()