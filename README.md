# 简介
基于 Napcat+Deepseek 开发的QQ机器人
## 特点
+ 阻塞型(高情商:模拟真人回复速度;低情商:网页卡死直接死翘翘)
+ 支持多个Tool Call调用链
+ **工具调用自动触发下一轮询问**(Agent多轮循环，详见 AGENT.md)
+ 支持回复表情
+ 信息过滤器,tool call支持热更新
+ **沙箱保护机制**: 自动检测并修复会话数据损坏，防止因文件异常导致机器人崩溃
+ **自动找话题功能**: 每个会话独立记录活跃时间，空闲超过设定时间后自动生成话题，打破冷场
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
    "CountTokens":false,//是否统计token使用情况
    "completion_tokens": 999999999999,//回复token剩余量(该部分会自动扣除)
    "prompt_cache_hit_tokens": 999999999999,//输入缓存命中token剩余量(该部分会自动扣除)
    "prompt_cache_miss_tokens": 999999999999,//输入缓存未命中token剩余量(该部分会自动扣除)
    "banned_user": [],//拉黑的QQ号
    "admin":[],//机器人管理员的QQ号
    "topicInterval": 1800000,//自动话题空闲时间(毫秒)，默认30分钟
    "topicCheckInterval": 30000,//自动话题轮询间隔(毫秒)，默认30秒
    "topicStartHour": 8,//自动话题开始时间(小时)，默认早上8点
    "topicEndHour": 23//自动话题结束时间(小时)，默认晚上23点
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
## 容器
每个用户的对话储存在 ./data/:id 下

其中 :id 表示用户类型(private/group)+用户id(群号/Q号)
(default为模板)

+ config.json 为AI使用的模型配置
```json
{
    "model":"gpt",//聊天模型
    "memorizing_model":"gpt",//记忆化模型
    "sendMust":100,//必须发送次数
    "probability":0.01//回复概率
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
+ prompt/topic.md 为自动找话题的提示词
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
客户端连接后每 topicCheckInterval 毫秒（默认30秒）轮询一次，检查是否需要自动找话题
## 自动找话题功能
机器人在每个会话（群聊/私聊）中独立记录**最后活跃时间**。当某个会话的空闲时间超过 `topicInterval`（默认30分钟）时，且当前时间在允许的时间段内，机器人会自动发起一个话题。

### 话题生成流程
1. **轮询检查**：每 `topicCheckInterval` 毫秒（默认30秒）遍历 `data/` 下的所有会话
2. **空闲判断**：检查会话的最后活跃时间，超过 `topicInterval` 毫秒未发言则判定为空闲
3. **时间段过滤**：仅在 `topicStartHour`（默认8点）到 `topicEndHour`（默认23点）之间触发，晚上不打扰
4. **读取提示词**：读取会话的 `prompt/topic.md` 作为话题生成提示词
5. **参考聊天记录**：读取最近10条聊天记录，让AI了解当前氛围
6. **AI生成话题**：调用AI模型，结合人设和聊天记录生成自然的话题消息
7. **发送并记录**：将话题发送到对应的群/私聊，并写入 `reply-x.json` 作为记忆

### 话题提示词
每个会话的 `prompt/topic.md` 用于定义如何生成话题。你可以针对不同群聊/私聊设置不同的话题风格。

示例内容（data/default/prompt/topic.md）：
```markdown
你是蓝色大肥鱼，一条懒散、傲娇、爱干饭、爱损人的蓝色大肥鱼。

当群里冷场时，你可以：
1. 吐槽今天的天气/饭菜/工作
2. 分享一个无聊但有趣的小知识
3. 突然问大家在干嘛
4. 讲一个冷笑话
5. 抱怨一下生活

要求：
- 话题要自然，像是突然想到什么就说了
- 不要提及"我在执行话题生成任务"之类的话
- 尽量简短有趣，容易接话
- 保持人设不走歪
```

### 配置项
| 配置项 | 默认值 | 说明 |
|---|---|---|
| `topicInterval` | 1800000 (30分钟) | 会话空闲多少毫秒后自动找话题 |
| `topicCheckInterval` | 30000 (30秒) | 轮询检查间隔（毫秒） |
| `topicStartHour` | 8 | 自动话题开始时间（小时，24小时制） |
| `topicEndHour` | 23 | 自动话题结束时间（小时，24小时制） |

### 注意事项
- 自动话题使用会话自己的模型配置（`config.json` 中的 `model` 字段）
- 话题提示词保存在 `prompt/topic.md`，每个会话独立
- 如果会话的 `topic.md` 不存在，会自动从 default 复制
- 生成话题时会锁定该会话，防止重复触发
- 话题消息会写入 `reply-x.json`，成为长期记忆的一部分
- 晚上23点到早上8点默认不会触发自动话题（可通过 `topicStartHour` / `topicEndHour` 调整）
## 沙箱保护机制
系统内置了统一的 `ensureSession` 函数，自动检测并修复会话数据损坏：

+ **config.json**：检查文件是否存在、是否为有效JSON，损坏时自动从 default 恢复
+ **模型名/model/sendMust/probability**：检查字段类型和合法性，异常时自动重置为默认值
+ **prompt 目录**：检查目录是否存在，损坏时自动从 default 复制
+ **system.md / memory.md / topic.md**：检查文件是否存在，损坏时自动从 default 恢复
+ **reply-x.json**：检查文件是否存在、是否为合法JSON数组，损坏时自动重置

所有保护在会话加载和AI询问时自动触发，无需手动干预。
# TODO
+ 添加更多生成类 tool calls,比如表情包制作
(不需要添加联网搜索类工具了，经实测，该机器人可以自己获取B站排行榜,新闻等)
+ 设置头衔(https://napcat.apifox.cn/226656931e0)
+ 点赞(https://napcat.apifox.cn/226656717e0,https://napcat.apifox.cn/226659197e0)
+ 加入 debug 模式
+ claude-fable-5,glm-5.1 模型测试不通过
+ 推进原子化