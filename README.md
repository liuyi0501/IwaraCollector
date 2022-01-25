# IwaraCollector
Iwara网站数据爬取及本地化
# 前言
编程初学者处女作，代码中包括但不限于：意义不明的变量、嵌套套来套去不得了的递归、随地大小缩进、各种怪力乱神语法、依靠BUG运行、性能损耗超级加倍。
# 程序功能
1. 以时间顺序以及喜欢数量爬取Iwara视频数据
2. 可视化数据预览
3. 视频在线播放
4. 全静态数据存储
5. 人性化数据结构
# 数据结构
./data/ecchi/
          -/page : 
            - [数字].json 按照时间顺序排序的页面文件
                结构(数据例)：{
                                "video":["xv7oqfbyoqfwxjavk","08veycjm59czprkkj?language=ja","gyr5zh6mznc72ryja?language=ja"],
                                "thumb":["//i.iwara.tv/sites/default/files/styles/thumbnail/public/videos/thumbnails/2361476/thumbnail-2361476_0015.jpg?itok=eZw1spR5","//i.iwara.tv/sites/default/files/styles/thumbnail/public/videos/thumbnails/2361445/thumbnail-2361445_0010.jpg?itok=TOBOeyZn","//i.iwara.tv/sites/default/files/styles/thumbnail/public/videos/thumbnails/2361427/thumbnail-2361427_0002.jpg?itok=znnrvWY8"],
                                "title":["对应video和thumb的视频标题","对应video和thumb的视频标题","对应video和thumb的视频标题"]
                              }
            - all.json 单独存储的总页数（是采集时的页数，如采集果被中断也不会变成中断时到了第几页）
                结构 ：{
                          "LastPage":"2683"
                       }
          -/api :
            - [视频ID].json 仅仅是用来存储从iwara上获取的视频下载的API数据
                结构 ：{"time":"1643109532636",
                        "data":[{"resolution":"Source","uri":"//sukone.iwara.tv/file.php?expire=1643131132&hash=031a9b51628a77e875cd27a1f01c966261a41d48&file=2022%2F01%2F24%2F1643047365_ZDmXWC8mYbiGgBGXk_Source.mp4&op=dl&r=0","mime":"video/mp4"},{"resolution":"540p","uri":"//ruko.iwara.tv/file.php?expire=1643131132&hash=113e4423923fde49377114b5428b114d0b9d56ef&file=2022%2F01%2F24%2F1643047365_ZDmXWC8mYbiGgBGXk_540.mp4&op=dl&r=0","mime":"video/mp4"},{"resolution":"360p","uri":"//momo.iwara.tv/file.php?expire=1643131132&hash=b5478824b43fd9089ff0579b725e22da22c5f3b0&file=2022%2F01%2F24%2F1643047365_ZDmXWC8mYbiGgBGXk_360.mp4&op=dl&r=0","mime":"video/mp4"}]
                      }
                      (time是时间戳，由于iwwra上获取的API数据存在有效期（好像是8小时？），所以设定的进行静态存储API数据6小时。时间错用来校验该静态缓存是否过期)
                      (data是iwara网站上的原石API数据，有些视频有三条，有些只有两条（没有540p之类的）)
          -/like ： 和/page 内的数据一样，只不过是按照like数量排序的
      - [ 视频ID ].json 是每一个唯一ID的视频的详细数据
              结构： {"title":"视频的标题",
                      "description":"视频的描述",
                      "thumb":"视频的缩略图（220x150）更大的缩略图和这个有关系",
                      "download":"https://ecchi.iwara.tv/api/video/", //视频在iwara的API的地址
                      "origin":"https://ecchi.iwara.tv/videos/082xwtkkaqczplrbz" //视频的源播放地址
                      }
# 食用方法
## 服务端
1. git下来
2. npm install
3. node app.js
服务器会监听 3001 ，可以再app.js中修改
## 爬虫端
1. git下来
2. npm install
3. 在根目录下：node ./utils/E-GetAllVideo.js 爬取视频，以时间从新到旧的顺序。
4. 在根目录下：node ./utils/E-GetLikeVideo.js 爬取视频，以点击喜欢多少的顺序的顺序。
# Todo
1. 更好看的界面
2. 在线播放使用更好的解析接口
3. 控制后台
