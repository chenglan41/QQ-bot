# 简介
基于 Napcat+Deepseek 开发的QQ机器人
## 特点
+ 阻塞型(高情商:模拟真人回复速度;低情商:网页卡死直接死翘翘)
+ 支持多个Tool Call调用链
+ **工具调用自动触发下一轮询问**(Agent多轮循环，详见 AGENT.md)
+ 支持回复表情
+ 信息过滤器,tool call支持热更新
## 配置
存放在 config.json 中
```js
{
    "maxLogSize":10485760,//最大日志长度(bytes)
    "port":8082,//websocket端口
    "uid":"",//QQ号
    "sendMust":100,//随机回复信息中保底信息数(接收100条信息至少回复一条)
    "probability":0.01,//随机回复信息的概率
    "returnToken":300000,//某次询问超过该tokens时自动将上下文转为记忆
    "httpPort":3000,//napcat的http服务器端口
    "httpToken":"",//napcat的http服务器令牌
    "CountTokens":false//是否统计token使用情况
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

包含以下工具:
+ 返回当前时间的 time
+ 用于发送表情的 emotion
表情存在 ./emotion/ 下
+ AI发图片用的 sendImage
+ AI发视频用的 sendVideo
+ AI读取文件用的 readFile
+ AI读取文件用的 readFile
+ AI写文件用的 writeFile
+ AI下载文件文件用的 download
+ AI上网用的 visiting
+ **AI Agent 沙盒工具**(虚拟终端+沙盒文件系统,共14个,详见 AGENT.md)
### 多轮询问(Agent循环)
AI 返回 tool_calls 时,**自动执行工具**并把结果发回给 AI 继续思考,
直到 AI 不再调用工具(返回纯文本回答)才回复用户。

+ 单条消息最多循环 10 轮,防止 AI 无限调用工具(改 index.js 中 MAX_AGENT_ROUNDS)
+ AI 一次返回多个工具时会全部执行,结果一起发回
+ 工具结果作为 tool 消息写入 reply-x.json,成为长期记忆

### 提示词
用空参数传入toolFunction
若返回 "skip" 则跳过一次询问
不处理可以返回 undefined

## 持久化变量
space变量储存在 ./space.json 中

可以在程序运行过程中修改文件是没用的

该部分需要 菜单功能.save 才能保存
### banned_user
一个数字数组，表示禁止回复该用户的信息
### admin
一个数字数组，表示管理员账户

只有管理员才可以进行一些未经许可的操作，如在QQ内封存记忆等
### completion_tokens,prompt_cache_hit_tokens,prompt_cache_miss_tokens
分别表示 输出消耗的总token数,命中缓存的token数,未命中缓存的token数
## 容器
每个用户的对话储存在 ./data/:id 下

其中 :id 表示用户类型(private/group)+用户id(群号/Q号)
(default为模板)

+ config.json 为AI使用的模型配置
```json
{
    "model":"gpt",//聊天模型
    "memorizing_model":"gpt",//记忆化模型
}
```
这里的值代指一套模型配置，在 /model.json 中定义

格式如下:
```json
{
    "名字": [
        {
            "baseURL": "https://example.com",//AI接入网址
            "apiKey": "sk-XXX"//apiKey
        },
        {
            "model": "gpt-5.6-sol",//模型名
            "thinking": {
                "type": "enabled"
            },
            "reasoning_effort": "max"
            //这里可以填写询问时的配置
            //如千问支持enabled_search:true
        },
        {
            "memory": 50000,//某次询问超过该token则记忆化
            "enabled_seeing":true//是否为视觉模型，通常从模型提供商口中得知
            //通常为模型上下文窗口大小的一半或3/4
        }
    ]
}
```
+ prompt/system.md 为 AI 的设定
+ prompt/memory.md 为持久记忆化的skill提示词
+ reply-x.json 为AI应答的聊天记录
+ content.txt 为完整的聊天记录
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
+ 添加更多生成类 tool calls,比如表情包制作
(不需要添加联网搜索类工具了，经实测，该机器人可以自己获取B站排行榜,新闻等)
+ 设置头衔(https://napcat.apifox.cn/226656931e0)
+ 点赞(https://napcat.apifox.cn/226656717e0,https://napcat.apifox.cn/226659197e0)
+ 加入 debug 模式
+ claude-fable-5,glm-5.1 模型测试不通过
+ 继续原子化
+ 添加AI自动找话题功能