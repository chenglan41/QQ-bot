# 简介
基于 Napcat+Deepseek 开发的QQ机器人
## 特点
+ 阻塞型(高情商:模拟真人回复速度;低情商:网页卡死直接死翘翘)
+ 支持多个Tool Call调用链
+ 支持回复表情
+ 信息过滤器,tool call支持热更新
## 配置
存放在 config.json 中
```js
{
    "baseURL":"https://api.deepseek.com/",//API提供商
    "apiKey":"",//SDK
    "maxLogSize":10485760,//最大日志长度(bytes)
    "model":"deepseek-v4-flash",//模型
    "thinking":{ "type": "disabled" },//是否开启思考模式
    "reasoning_effort": "high",//思考强度
    "stream": false,//流式加载(不建议开启)
    "port":8082,//websocket端口
    "uid":"",//QQ号
    "sendMust":100,//随机回复信息中保底信息数(接收100条信息至少回复一条)
    "probability":0.01,//随机回复信息的概率
    "saveTime":100000,//space变量自动保存时间(ms)
    "enableContent2Memory":true,//是否允许上下文自动转为记忆
    "returnToken":300000,//某次询问超过该tokens时自动将上下文转为记忆
    "httpPort":3000,//napcat的http服务器端口
    "httpToken":""//napcat的http服务器令牌
}
```
## 启动
在Napcat Web UI 网络配置中添加一个`Websocket客户端`

`node .`启动即可

如果你发现缺失某些文件，可以试着先启动看看是否会补全
## 过滤器
判断是否回复消息的函数储存在 filter 函数中

若该函数返回 true 则会回复该消息

该函数传入三个参数
back: 返回消息，包括type(group群消息/private私聊),id(群号/QQ号)
msg: 文字消息
at: @列表

支持热更新
## tool calls
储存在 lib/tools.js 中

格式为 deepseek 的 tool calls

包含三个工具:
+ 用于联网搜索的 https/http
+ 用于发送表情的 emotion

表情存在 ./emotion/ 下
+ 返回当前时间的 time
+ 请求执行指令的 cmdRequest
+ 写入文件的 writeFile
### 提示词
用空参数传入toolFunction
若返回 "skip" 则跳过一次询问
不处理可以返回 undefined

## 持久化变量
space变量储存在 ./space.json 中

可以在程序运行过程中修改文件是没用的
### content
存放聊天记录

每个聊天记录的键为`private/group+id`

```json
{
    "content": {
        "private123456": [],
        "group114514": [
            {
                "role": "user",
                "content": "橙蓝:行"
            },
            {
                "role": "assistant",
                "content": "主人~你是不是在看什么恋爱番或者玩什么角色扮演游戏呀？听起来好甜好纠结的剧情喵"
            }
        ]
    }
}
```
### banned_user
一个数字数组，表示禁止回复该用户的信息
### admin
一个数字数组，表示管理员账户

只有管理员才可以进行一些未经许可的操作，如在QQ内封存记忆等
### exec
一个字符串数组，储存待执行的指令/写入文件操作
### completion_tokens,prompt_cache_hit_tokens,prompt_cache_miss_tokens
分别表示 输出消耗的总token数,命中缓存的token数,未命中缓存的token数
### TokenStatistics
统计token在每个聊天记录的使用情况
储存格式为
```json
{
    "TokenStatistics":{
        "type+id":[
            ["时间","某次询问消耗的token"],
            ["时间","某次询问消耗的token"],
            ["时间","某次询问消耗的token"]
        ]
    }
}
```
## 记忆化
当某次询问超过该tokens时自动将上下文转为记忆，

其中，上下文转记忆的AI提示词储存在 AI_Memory_System.md 中（本项目预设了一套提示词）

其中包含一些特殊标记:
### ${system}
询问时会被替换为系统身份提示词
### ${content}
询问时会被替换为上下文
## 定时任务
定时任务储存在 lib/task.js
客户端连接后每 24小时 触发一次
# TODO
+ 修改操作工具使其操作对象缩小（只针对指定聊天记录修改）
+ 添加更多生成类 tool calls,比如表情包制作
(不需要添加联网搜索类工具了，经实测，该机器人可以自己获取B站排行榜,新闻等)
+ 加强提示词工程(比如在prompt/system.md声明如何查资料等信息)
+ 设置头衔(https://napcat.apifox.cn/226656931e0)
+ 点赞(https://napcat.apifox.cn/226656717e0,https://napcat.apifox.cn/226659197e0)
+ 原子化，将能设置开启/关闭的选项独立出来
+ 加入 debug 模式
+ 接入浏览器，接入node-pty(或sandbox)
+ Ai小镇（？）