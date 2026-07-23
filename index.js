import OpenAI from "openai"
import log4js from "log4js"
import fs from "fs"
import axios from "axios"
import { WebSocketServer } from "ws"
import { dync } from "./lib/dync.js"
import { execSync } from "child_process"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
// 获取当前文件的完整路径（含文件名）
const __filename = fileURLToPath(import.meta.url);
// 获取当前文件所在目录
const __dirname = dirname(__filename);
const config = JSON.parse(fs.readFileSync("config.json").toString())
const openai = new OpenAI({
    baseURL: config.baseURL,
    apiKey: config.apiKey,
});
const wss = new WebSocketServer({ port: config.port });
log4js.configure({
    appenders: {
        System: {
            type: "file",
            filename: `./log/${new Date().getTime()}.log`,
            maxLogSize: config.maxLogSize,
            backups: 200
        },
        Console: { type: "console" },
    },
    categories: {
        default: { appenders: ["Console", "System"], level: "debug" }
    },
});
const logger = log4js.getLogger("QQ");
dync.set("link", []);
var sendMust = 0;
wss.on('connection', (ws) => {
    dync.change("link", (link) => {
        ws.id = link.length;
        logger.debug(`客户端 ${ws.id} 已连接`);
        link.push(true);
        return link;
    })
    ws.on('message', async (data) => {
        //ws接收
        data = JSON.parse(data.toString());
        logger.debug(data);
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
                    msg += item.data.text.replace(/ /gi, "");
                }
                else if (item.type == "at") {
                    at.push(item.data.qq);
                }
            })
        }
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
            // logger.info(content)
            if (content == "") return;//不发送空消息
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
        eval(fs.readFileSync("./lib/menu.js").toString());
        if (_over_ == true) return;
        //询问器A
        //1.取出临时记忆并放到tmp
        //2.刚发的信息压入tmp
        //3.把tmp发给询问器A
        //4.得到 回答 后把 刚发的信息 和 回答 直接压入临时记忆
        //不要直接替换，只能压入，不然多个请求时会被盖住
        //刚发的信息 和 回答 同时压入临时记忆可以防止断裂
        var memory = dync.read("TemporaryMemory")[back.type + back.id];
        if (back.type == "group") msg = data.sender.nickname + ":" + msg;
        if (memory == undefined) memory = [];
        //memory是临时记忆
        var queue = [];
        //queue是要处理的信息
        queue.push({
            "role": "user",
            "content": msg
        });
        //询问器A
        for (var i = 0; i < queue.length; i++) {
            var tools, toolFunction;

            eval(fs.readFileSync("./lib/tools.js").toString());
            var question = await openai.chat.completions.create({
                messages: [...dync.read("prompt"), ...memory, ...queue],
                model: config.model,
                thinking: config.thinking,
                reasoning_effort: config.reasoning_effort,
                stream: config.stream,
                user_id: "1",
                tools: tools
            });
            queue.push(question.choices[0].message);
            i++
            reply(question.choices[0].message.content)
            if (question.choices[0].message.tool_calls != undefined) {
                question.choices[0].message.tool_calls.forEach(item => {
                    Object.keys(toolFunction).forEach(_item => {
                        if (item.function.name == _item) {
                            queue.push({
                                role: "tool",
                                tool_call_id: item.id,
                                content: toolFunction[_item](
                                    JSON.parse(item.function.arguments)
                                )
                            })
                        }
                    })
                })
                i += question.choices[0].message.tool_calls.length - 1;
            }
        }
        dync.change("TemporaryMemory", (tm) => {
            if (tm[back.type + back.id] == undefined) tm[back.type + back.id] = [];
            tm[back.type + back.id] = [...tm[back.type + back.id], ...queue]
            return tm;
        })
    });

    // 连接关闭
    ws.on('close', () => {
        logger.debug('客户端已断开连接');
    });
});

logger.debug('WebSocket 服务端已启动');