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
    "emotionPath":"file://.../",//表情存放路径,以`file://`开头`/`结尾
    "banned_user":[]//封禁的用户QQ号，此部分不会热更新
}
```
## 启动
在Napcat Web UI 网络配置中添加一个`Websocket客户端`

`node .`启动即可
## 过滤器
判断是否回复消息的函数储存在 filter 函数中

若该函数返回 true 则会回复该消息

该函数传入三个参数
back: 返回消息，包括type(group群消息/private私聊),id(群号/QQ号)
msg: 文字消息
at: @列表

支持热更新
## 工具
储存在 lib/tools.js 中

格式为 deepseek 的 tool calls

包含三个工具:
+ 用于联网搜索的 https/http
+ 用于发送表情的 emotion
表情存在 ./emotion/ 下

需要注意的是，在 lib/tools.js 找到 `file://.../` 部分把它改为 emotion 的绝对路径

比如`file:///E:/QQBot/emotion/`
## 动态变量
动态变量储存在 ./var.json 中

可以在程序运行过程中修改他们

### link
其中，link表示储存的客户端状态

等你的napcat连接时日志会告诉你索引，

通过控制该索引对应项的 true/false 可以控制是否处理该客户端的信息
### skill
skill 用来储存系统提示词

比如:
```json
{
    "skill": [
        {
            "role": "system",
            "content": "你是一只猫娘..."
        }
    ]
}
```
### TemporaryMemory
存放聊天记录

每个聊天记录的键为`private/group+id`

```json
{
    "TemporaryMemory": {
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
# TODO
+ 修复 emotion 需要自己指定绝对路径的 Bug
+ 添加更多生成类 tool calls,比如表情包制作
(不需要添加联网搜索类工具了，经实测，该机器人可以自己获取B站排行榜,新闻等)