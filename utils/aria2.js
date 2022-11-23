var axios = require('axios');
const crypto = require('crypto')

var aria2 = [];
//下面这个是单个文件下载的
const url = 'https://aria2.wobbay.xyz:6800/jsonrpc';//aria2的JSONRPC地址
const modelJsonrpc = {
	"jsonrpc": "2.0", 
	"id": "这个可以自定义",
	"method": "aria2.addUri",
	"params":[
		"token:Xingmeng123",
		["http://xxx.com/xxx.xx  这里写需要下载的文件地址"],
		{
		    "dir":"这里写需要下载的绝对路径，这一行可以不填，则默认下载到aria2.conf里设置的下载地址",
		    "out": '文件名'
		}
	]
}

aria2.download = (opt) => {
    for ( i = 0; i < opt.length; i++ ){
        
        let jsonrpc = modelJsonrpc;
        jsonrpc.id = opt[i].id ? opt[i].id : crypto.createHash("md5").update(opt[i].url).digest('hex');
        jsonrpc.params[1] = opt[i].url;
        opt[i].dir ? jsonrpc.params[2].dir = opt[i].dir : delete jsonrpc.params[2].dir;
        opt[i].out ? jsonrpc.params[2].out = opt[i].out : delete jsonrpc.params[2].out;
        
        axios.post(url, {data: jsonrpc}).then((response) =>{
            console.log(response.data);
        }).catch(e => {
            console.log(e);
        })
    }
}

aria2.download( [{
    id : '1',
    url : 'https://iwara.wobbay.xyz',
    dir : '/www/wwwroot/node/IwaraCollector',
    out: 'test.html'
}] )

module.exports = aria2;

 /*
//下面这个是多个文件下载的，就是把上面这个作为数组的元素就行了
[
{
	"jsonrpc": "2.0", 
	"id": "这个可以自定义",
	"method": "aria2.addUri",
	"params":[
		"token:这里写你aria2.conf里设置的rpc-secret",
		["http://xxx.com/xxx.xx  这里写需要下载的文件地址"],
		{"dir":"这里写需要下载的绝对路径，这一行可以不填，则默认下载到aria2.conf里设置的下载地址"}
	]
},
{
	"jsonrpc": "2.0", 
	"id": "这个可以自定义",
	"method": "aria2.addUri",
	"params":[
		"token:这里写你aria2.conf里设置的rpc-secret",
		["http://xxx.com/xxx.xx  这里写需要下载的文件地址"],
		{"dir":"这里写需要下载的绝对路径，这一行可以不填，则默认下载到aria2.conf里设置的下载地址"}
	]
}
]
*/