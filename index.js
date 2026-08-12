import OpenAI from "openai"
import log4js from "log4js"
import fs from "fs"
import axios from "axios"
import path from "path"
import http from "http"
import https from "https"
import { WebSocketServer } from "ws"
import { execSync } from "child_process"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
var space = JSON.parse(fs.readFileSync("space.json").toString());
// 获取当前文件的完整路径（含文件名）
const __filename = fileURLToPath(import.meta.url);
// 获取当前文件所在目录
const __dirname = dirname(__filename);
const config = JSON.parse(fs.readFileSync("config.json").toString())
const model = JSON.parse(fs.readFileSync("model.json").toString())
function getPathSizeSync(p) {
    let total = 0;
    const stat = fs.statSync(p);
    if (stat.isFile()) return stat.size;
    for (const name of fs.readdirSync(p)) {
        total += getPathSizeSync(path.join(p, name));
    }
    return total;
}
const wss = new WebSocketServer({ port: config.wsPort });
log4js.configure({
    appenders: {
        System: {
            type: "file",
            filename: `./log/logger.log`,
            maxLogSize: config.maxLogSize,
            backups: 9999
        },
        Console: { type: "console" },
    },
    categories: {
        default: { appenders: ["Console", "System"], level: "debug" }
    },
});
const logger = log4js.getLogger("QQ");
if (fs.existsSync("lib/task.js") == false) fs.writeFileSync("lib/task.js", "//定时任务");

wss.on('connection', (ws) => {
    logger.info("有客户端连接")
    setInterval(() => {
        eval(fs.readFileSync(("lib/task.js")).toString())
    }, 24 * 60 * 60 * 1000)
    ws.on('message', async (data) => {
        //ws接收
        data = JSON.parse(data.toString());
        // logger.debug(data.message);
        //记录返回ID和返回类型
        var back = {}
        if (data.group_id != undefined) {
            back = {
                type: "group",
                id: data.group_id
            }
        }
        else if (data.user_id != undefined) {
            back = {
                type: "private",
                id: data.user_id
            }
        }
        // logger.info(back)
        // return
        //记录信息
        var msg = "";
        var at = [];
        if (data.message != undefined && typeof data.message == "object") {
            data.message.forEach(item => {
                if (item.type == "text") {
                    msg += item.data.text;
                }
                else if (item.type == "at") {
                    // msg += `(@)[${item.data.qq}]`
                    at.push(item.data.qq);
                }
                // else if (item.type == "image") {
                //     msg += `(image)[${item.data.url}]`
                // }
                // else if (item.type == "video") {
                //     msg += `(video)[${item.data.url}]`
                // }
            })
        }
        if (msg == "" || msg == " " || msg == null) return //检查空消息
        if (back.type == "group") msg = data.sender.nickname + ":" + msg;
        var boxConfig;//临时解决cpSync失效问题
        if (fs.existsSync(`./data/${back.type + back.id}`) == false) {
            boxConfig = JSON.parse(fs.readFileSync(`./data/default/config.json`));
            fs.cpSync(`./data/default/`, `./data/${back.type + back.id}/`, {
                // 允许复制目录
                recursive: true,
                // 覆盖已存在文件
                force: true
            })
        }
        else boxConfig = JSON.parse(fs.readFileSync(`./data/${back.type + back.id}/config.json`));
        fs.writeFileSync(`./data/${back.type + back.id}/content.txt`, msg + "\n", { flag: "a+" });
        //过滤器
        var filter;
        eval(fs.readFileSync("./lib/filter.js").toString())
        if (
            filter(
                back,
                msg,
                at
            ) == false
        ) return;

        var reply = (content) => {
            logger.info(msg, content)
            if (content == "" || content == null) return;//不发送空消息
            if (back.type == "private") {
                ws.send(JSON.stringify({
                    "action": "send_private_msg",
                    "params": {
                        "user_id": back.id,
                        "message": content
                    },
                    "echo": ""
                }));
            }
            else if (back.type == "group") {
                ws.send(JSON.stringify({
                    "action": "send_group_msg",
                    "params": {
                        "group_id": back.id,
                        "message": content
                    },
                    "echo": ""
                }));
            }
        }
        var _over_ = false;
        if (space.sendMust[back.type + back.id] == undefined || space.sendMust[back.type + back.id] == null) {
            space.sendMust[back.type + back.id] = 0;
        }
        eval(fs.readFileSync("./lib/menu.js").toString());
        if (_over_ == true) return;
        
        if (model[boxConfig.model][2].enabled_seeing == true) {
            msg = [
                // { "type": "image_url", "image_url": { "url": val.url } },
                { "type": "text", "text": msg }
            ];
            data.message.forEach(item => {
                if (item.type == "image") {
                    msg.push( { "type": "image_url", "image_url": { "url": item.data.url } })
                }
                else if (item.type == "video") {
                    msg.push( { "type": "video_url", "video_url": { "url": item.data.url } })
                }
            })
        }
        //询问器A
        //1.取出临时记忆并放到tmp
        //2.刚发的信息压入tmp
        //3.把tmp发给询问器A
        //4.得到 回答 后把 刚发的信息 和 回答 直接压入临时记忆
        //不要直接替换，只能压入，不然多个请求时会被盖住
        //刚发的信息 和 回答 同时压入临时记忆可以防止断裂
        var prompt = [];
        prompt.push({
            "role": "user",
            "content": msg
        })
        //询问器A
        for (var i = 0; i < prompt.length; i++) {
            var tools, toolFunction;

            eval(fs.readFileSync("./lib/tools.js").toString());
            var openai = new OpenAI(model[boxConfig.model][0]);
            var question = await openai.chat.completions.create({
                messages: [
                    {
                        "role": "system",
                        "content": fs.readFileSync(`./data/${back.type + back.id}/prompt/system.md`).toString()
                    },
                    ...JSON.parse("[" + fs.readFileSync(`./data/${back.type + back.id}/reply-x.json`, { flag: "a+" }).toString() + "]"),
                    ...prompt
                ],
                ...model[boxConfig.model][1],
                stream: false,
                user_id: "1",
                tools: tools
            });
            prompt.push(question.choices[0].message);
            i++;
            reply(question.choices[0].message.content)
            if (question.choices[0].message.tool_calls != undefined) {
                question.choices[0].message.tool_calls.forEach(item => {
                    logger.info(item.function.name);
                    Object.keys(toolFunction).forEach(_item => {
                        // logger.debug(JSON.parse(item.function.arguments))
                        if (item.function.name == _item) {
                            var tmp = toolFunction[_item](JSON.parse(item.function.arguments));
                            prompt.push({
                                role: "tool",
                                tool_call_id: item.id,
                                content: (typeof tmp == "string") ? tmp : ""
                            })
                            if (toolFunction[_item]() == "skip") i++;
                        }
                    })
                })
                i += question.choices[0].message.tool_calls.length - 1;
            }
            prompt.forEach(item => {
                fs.writeFileSync(
                    `./data/${back.type + back.id}/reply-x.json`,
                    (fs.statSync(`./data/${back.type + back.id}/reply-x.json`).size == 0 ? "" : ",\n") +
                    JSON.stringify(item),
                    { flag: "a+" }
                )
            })
            space.completion_tokens += question.usage.completion_tokens
            space.prompt_cache_hit_tokens += question.usage.prompt_cache_hit_tokens
            space.prompt_cache_miss_tokens += question.usage.prompt_cache_miss_tokens
            if (config.CountTokens) {
                fs.writeFileSync(
                    `./data/${back.type + back.id}/token.csv`,
                    `${new Date()},${question.usage.total_tokens}`,
                    { flag: "a+" }
                )
            }
            space.TokenStatistics[back.type + back.id].push([new Date(), question.usage.total_tokens])
            if (question.usage.total_tokens > model[boxConfig.memorizing_model][2].memory) {
                var openai = new OpenAI(model[boxConfig.memorizing_model][0]);
                var tmp = await openai.chat.completions.create({
                    messages: [
                        {
                            "role": "system",
                            "content": fs.readFileSync(`./data/${back.type + back.id}/prompt/memory.md`).toString()
                                .replace(/\${system}/gi, JSON.stringify(fs.readFileSync(`./data/${back.type + back.id}/prompt/system.md`).toString()))
                                .replace(/\${content}/gi, "[" + fs.readFileSync(`./data/${back.type + back.id}/reply-x.json`).toString() + "]")
                        }
                    ],
                    ...model[boxConfig.memorizing_model][1],
                    stream: false,
                    user_id: "1",
                    tools: []
                });
                fs.writeFileSync(
                    `./data/${back.type + back.id}/reply-x.json`,
                    JSON.stringify(tmp.choices[0].message)
                )
            }
        }
    });

    // 连接关闭
    ws.on('close', () => {
        logger.debug('客户端已断开连接');
    });
});

logger.debug('WebSocket 服务端已启动');