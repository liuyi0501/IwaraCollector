接口：
    1. GET /api/video/:site/:id --单一视频详细信息
                                --多视频详细信息请见4. 
        @params :site ['www','ecchi']
        @params :id 十七位ID
        响应体:{
                "code":200,
                "message":"获取视频数据成功",
                "data":[{
                    "title":"",
                    "postDate":"YYYY-MM-DD HH:ii",
                    "timestamp": int / ms,//数字，毫秒级
                    "id":[
                        ""//17位数字字母组合
                    ],
                    "thumb":"//i.iwara.tv/sites/default/files/videos/thumbnails/2921241/thumbnail-2921241_0002.jpg",//URL
                    "author":"",//字符串，同为用户ID
                    "thumb_id":"2921241",//字符串数字
                    "desc":"",//HTML 代码字符串，不保证安全性
                    "tag":[
                        "Uncategorized"
                    ],//标签数组，同为标签ID
                    "catchTime":1659686529964    ,//爬取时间戳，毫秒级
                    "watchNum":"380",//爬取时官方浏览数量
                    "likeNum":"3",//爬取时官方喜欢数量
                    "other":{
                        "youtube":null//是否为YouTube外链视频，如果时此处是HTML <iframe>代码
                    }
                }]
                }
    2. GET /api/videos/:site/:sort?size=&page
    @params :site ['www','ecchi'] 
    @params :sort ['date', 'like', 'watch']
        date: 获取按照时间顺序最近的视频
        like: 获取按照官方like人数最多的视频
        watch: 获取按照官方查看数量最多的视频
        如果不填写，会返回{code:403}。
    @query size int 非必须，大于 0。小于等于0则按照默认返回
    @query page int 非必须，1 为开始
        size: 此次获取数据的数量。不填写默认36
        page: 获取数据位于第几页，页数根据size决定。不填写默认1;
        响应体:{//此处以sort = date 为例
                "code":200,
                "message":"获取最新视频数据成功",
                "data":[{
                        "member":[
                            "7ar27t1wbrhgjelak"//视频ID
                        ],
                            "score":"1659686760000"//视频发布时间，如果是like,watch。那么会是like数目和watch数目
                        }]
                }
    3. GET /api/user/:site/:author
        @params :site ['www', 'ecchi']
        @params :author 用户ID，不是用户昵称。
        响应体:{
                "code":200,
                "message":"获取用户数据成功",
                "data":{
                    "nickname":"",//用户昵称
                    "joinDate":"YYYY-MM-DD",//
                    "description":"",//HTML 不保证安全
                    "picture":"",//URL
                    "catchTime":1659691264286,//时间戳，毫秒级
                    "id":"",//用户ID，很可能是中文，后台会encodeURI()
                    "videos":[{
                        "member":"a5a7wh8oreclb3yno",
                        "score":"1659359460000"
                        }]//视频的数组，member是视频ID,score是视频发布时间
                    }
                }
    4. GET /api/video/:site/list.json
    @params :site ['www', 'ecchi']
    @query videos: 示例: /list.json?ID1,ID2,ID3
            不要出现其他样式。
    
    5. GET /api/tag/:site/:tag
    @params :site ['www', 'ecchi']
    @params :tag tag标签的名称，区分大小写。
    
    6. 老版 GET /:site/api?url=
        @params :site ['www', 'ecchi']
        
        @query url 完整链接，类似于：https://ecchi.iwara.tv/api/video/reyrjilo9soaka51