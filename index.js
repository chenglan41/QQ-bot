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
import * as Agent from "./lib/agent/agent.js"
// 让 lib/tools.js（eval 执行）也能访问 Agent 模块
globalThis.Agent = Agent;
var sendMust = {
};
// 获取当前文件的完整路径（含文件名）
const __filename = fileURLToPath(import.meta.url);
// 获取当前文件所在目录
const __dirname = dirname(__filename);
const config = JSON.parse(fs.readFileSync("config.json").toString())
const model = JSON.parse(fs.readFileSync("model.json").toString())
function isJson(str) {
    try {
        JSON.parse(str);
        return true;
    } catch {
        return false;
    }
}
// ==================== 沙箱保护函数 ====================
/**
 * 沙箱保护：检查并修复 config.json
 * @param {string} sessionPath - 会话路径，如 "./data/group123456"
 * @param {object} defaultConfig - 默认配置对象
 * @returns {object} 解析后的配置对象
 */
function ensureConfigJson(sessionPath, defaultConfig) {
    if (
        !fs.existsSync(`${sessionPath}/config.json`) ||
        !fs.statSync(`${sessionPath}/config.json`).isFile() ||
        !isJson(fs.readFileSync(`${sessionPath}/config.json`).toString())
    ) {
        fs.rmSync(`${sessionPath}/prompt`, { recursive: true, force: true });
        fs.copyFileSync(`./data/default/config.json`, `${sessionPath}/config.json`)
        logger.warn(`${sessionPath}/config.json 出现问题，已修复`)
    }
    return JSON.parse(fs.readFileSync(`${sessionPath}/config.json`).toString());
}

/**
 * 沙箱保护：检查并修复会话配置中的关键字段
 * 包括：model（模型名）、sendMust（必须发送次数）、probability（回复概率）
 * @param {object} boxConfig - 当前会话配置
 * @param {object} modelMap - 模型映射表
 */
function ensureBoxConfigFields(boxConfig, modelMap) {
    const defaultBox = JSON.parse(fs.readFileSync("./data/default/config.json").toString());
    // 保护 memorizing_model
    if (typeof boxConfig.model != "string" || modelMap[boxConfig.memorizing_model] == undefined) {
        boxConfig.memorizing_model = defaultBox.memorizing_model;
        logger.warn(`模型名出现问题，将使用默认模型名: ${boxConfig.memorizing_model}`)
    }
    // 保护 model
    if (typeof boxConfig.model != "string" || modelMap[boxConfig.model] == undefined) {
        boxConfig.model = defaultBox.model;
        logger.warn(`模型名出现问题，将使用默认模型名: ${boxConfig.model}`)
    }
    // 保护 sendMust
    if (typeof boxConfig.sendMust != "number" || boxConfig.sendMust < 0 || !Number.isInteger(boxConfig.sendMust)) {
        boxConfig.sendMust = defaultBox.sendMust;
        logger.warn(`sendMust 出现问题，将使用默认值: ${boxConfig.sendMust}`)
    }
    // 保护 probability
    if (typeof boxConfig.probability != "number" || boxConfig.probability < 0 || boxConfig.probability > 1) {
        boxConfig.probability = defaultBox.probability;
        logger.warn(`probability 出现问题，将使用默认值: ${boxConfig.probability}`)
    }
}

/**
 * 沙箱保护：检查并修复 prompt 目录
 * @param {string} sessionPath - 会话路径
 */
function ensurePromptDir(sessionPath) {
    if (
        !fs.existsSync(`${sessionPath}/prompt`) ||
        !fs.statSync(`${sessionPath}/prompt`).isDirectory()
    ) {
        fs.rmSync(`${sessionPath}/prompt`, { recursive: true, force: true });
        fs.cpSync(`./data/default/prompt`, `${sessionPath}/prompt`, {
            recursive: true,
            force: true
        })
        logger.warn(`${sessionPath}/prompt 出现问题，已修复`)
    }
}

/**
 * 沙箱保护：检查并修复 prompt 目录下的指定文件（如 system.md、memory.md）
 * @param {string} sessionPath - 会话路径
 * @param {string} fileName - 文件名，如 "system.md"、"memory.md"
 */
function ensurePromptFile(sessionPath, fileName) {
    if (
        !fs.existsSync(`${sessionPath}/prompt/${fileName}`) ||
        !fs.statSync(`${sessionPath}/prompt/${fileName}`).isFile()
    ) {
        fs.rmSync(`${sessionPath}/prompt/${fileName}`, { recursive: true, force: true });
        fs.cpSync(`./data/default/prompt/${fileName}`, `${sessionPath}/prompt/${fileName}`, {
            force: true
        })
        logger.warn(`${sessionPath}/prompt/${fileName} 出现问题，已修复`)
    }
}

/**
 * 沙箱保护：检查并修复 reply-x.json 文件
 * @param {string} sessionPath - 会话路径
 */
function ensureReplyXJson(sessionPath) {
    if (
        !fs.existsSync(`${sessionPath}/reply-x.json`) ||
        !fs.statSync(`${sessionPath}/reply-x.json`).isFile() ||
        !isJson("[" + fs.readFileSync(`${sessionPath}/reply-x.json`).toString() + "]")
    ) {
        fs.rmSync(`${sessionPath}/reply-x.json`, { recursive: true, force: true })
        logger.warn(`${sessionPath}/reply-x.json 出现问题，已修复`)
    }
}
// ====================================================

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
        // logger.debug(JSON.stringify(data.message))
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
        var reply = (content) => {
            // setTimeout(() => {
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
                        "message": [
                            // { type: 'at', data: { qq: data.sender.user_id.toString() } },
                            // {
                            //     "type": "reply",
                            //     "data": {
                            //         "id": "string",
                            //         "seq": data.message_seq
                            //     }
                            // },
                            (typeof content == "string") ? { type: 'text', data: { text: content } } : content
                        ]
                    },
                    "echo": ""
                }));
            }
            // }, 3000)
        }

        var _over_ = false;
        if (msg[0] == "#") eval(fs.readFileSync("./lib/menu.js").toString());
        if (back.type == "group") msg = JSON.stringify({
            "user": data.sender.nickname,
            "msg": msg
        });
        var sessionPath = `./data/${back.type + back.id}`;
        var boxConfig;
        if (fs.existsSync(sessionPath) == false) {
            boxConfig = JSON.parse(fs.readFileSync(`./data/default/config.json`));
            fs.cpSync(`./data/default/`, sessionPath, {
                recursive: true,
                force: true
            })
        } else {
            // 沙箱保护：config.json
            boxConfig = ensureConfigJson(sessionPath, config);
        }
        // 沙箱保护：会话配置关键字段（model / sendMust / probability）
        ensureBoxConfigFields(boxConfig, model);
        // 将会话配置中的 sendMust 和 probability 同步到全局 config（供 filter.js 使用）
        fs.writeFileSync(`${sessionPath}/content.txt`, msg + "\n", { flag: "a+" });
        //过滤器
        var filter;
        eval(fs.readFileSync("./lib/filter.js").toString())
        if (sendMust[back.type + back.id] == undefined || sendMust[back.type + back.id] == null || sendMust[back.type + back.id] == NaN) {
            sendMust[back.type + back.id] = 0;
        }
        if (
            filter(
                back,
                msg,
                at
            ) == false
        ) return;
        if (_over_ == true) return;
        // 沙箱保护：模型名
        if (model[boxConfig.model][2].enabled_seeing == true) {
            msg = [
                { "type": "text", "text": msg }
            ];
            data.message.forEach(item => {
                if (item.type == "image") {
                    msg.push({ "type": "image_url", "image_url": { "url": item.data.url } })
                }
                else if (item.type == "video") {
                    msg.push({ "type": "video_url", "video_url": { "url": item.data.url } })
                }
            })
        }
        //询问器A
        var prompt = [];
        prompt.push({
            "role": "user",
            "content": msg
        })
        //询问器A：Agent 多轮循环（工具调用自动触发下一轮询问）
        //AI 一旦返回 tool_calls，就执行对应工具并把结果发回给 AI 继续思考，
        //直到 AI 不再调用工具给出最终回答，或达到最大轮数上限（防止无限循环）
        var MAX_AGENT_ROUNDS = 10; // 单条消息最大 Agent 循环轮数，可按需调整
        var lastUsage = null; // 记录最后一次询问的 token 用量（用于记忆化判断）
        for (var i = 0; i < MAX_AGENT_ROUNDS; i++) {
            var tools, toolFunction;
            //每次循环重新读取 lib/tools.js，支持热更新

            eval(fs.readFileSync("./lib/tools.js").toString());
            var openai = new OpenAI(model[boxConfig.model][0]);
            var question;
            try {
                // 沙箱保护：prompt 目录
                ensurePromptDir(sessionPath);
                // 沙箱保护：prompt 下的文件
                ensurePromptFile(sessionPath, "system.md");
                // 沙箱保护：reply-x.json
                ensureReplyXJson(sessionPath);
                question = await openai.chat.completions.create({
                    messages: [
                        {
                            "role": "system",
                            "content": fs.readFileSync(`${sessionPath}/prompt/system.md`).toString()
                        },
                        ...JSON.parse("[" + fs.readFileSync(`${sessionPath}/reply-x.json`, { flag: "a+" }).toString() + "]"),
                        ...prompt
                    ],
                    ...model[boxConfig.model][1],
                    stream: false,
                    user_id: "1",
                    tools: tools
                });
            } catch (e) {
                logger.error(e)
                break;
            }
            if (question.choices == undefined) break;
            var message = question.choices[0].message;
            //AI 的回答（含工具调用请求）压入本轮对话
            prompt.push(message);
            //token 用量统计
            if (question.usage != undefined) {
                lastUsage = question.usage;
                config.completion_tokens -= question.usage.completion_tokens
                config.prompt_cache_hit_tokens -= question.usage.prompt_cache_hit_tokens
                config.prompt_cache_miss_tokens -= question.usage.prompt_cache_miss_tokens
                fs.writeFileSync("./config.json", JSON.stringify(config));
                if (config.CountTokens) {
                    fs.writeFileSync(
                        `${sessionPath}/token.csv`,
                        `${new Date()},${question.usage.total_tokens}\n`,
                        { flag: "a+" }
                    )
                }
            }
            //没有工具调用：这就是最终回答，回复后结束循环
            if (message.tool_calls == undefined || message.tool_calls.length == 0) {
                reply(message.content);
                break;
            }
            //有工具调用：先把 AI 的过程说明（如果有）发给用户，再执行工具
            if (message.content != undefined && message.content != "") {
                reply(message.content);
            }
            //执行全部工具调用，把结果压入本轮对话
            var hasToolResult = false;
            message.tool_calls.forEach(item => {
                logger.debug(item.function.name);
                var tmp = "";
                if (toolFunction[item.function.name] != undefined) {
                    try {
                        tmp = toolFunction[item.function.name](JSON.parse(item.function.arguments));
                    } catch (e) {
                        tmp = e.toString();
                    }
                } else {
                    tmp = `错误: 未知工具 ${item.function.name}`;
                }
                //兼容 skip 机制：工具返回 "skip" 时该轮不再追问
                if (tmp == "skip") return;
                prompt.push({
                    role: "tool",
                    tool_call_id: item.id,
                    content: (typeof tmp == "string") ? tmp : ""
                })
                hasToolResult = true;
            })
            //没有任何工具结果（全部 skip 或工具未知），不再追问
            if (hasToolResult == false) break;
            //继续下一轮：把工具结果发回给 AI，自动触发下一轮询问
        }
        //把本轮全部对话（含工具调用与结果）压入临时记忆
        prompt.forEach(item => {
            fs.writeFileSync(
                `${sessionPath}/reply-x.json`,
                (fs.statSync(`${sessionPath}/reply-x.json`).size == 0 ? "" : ",\n") +
                JSON.stringify(item),
                { flag: "a+" }
            )
        })
        prompt = []
        //记忆化：上下文超限时用记忆模型压缩历史
        if (lastUsage != null && lastUsage.total_tokens > model[boxConfig.memorizing_model][2].memory) {
            var openai = new OpenAI(model[boxConfig.memorizing_model][0]);
            // 沙箱保护：memory.md
            ensurePromptFile(sessionPath, "memory.md");
            var tmp = await openai.chat.completions.create({
                messages: [
                    {
                        "role": "system",
                        "content": fs.readFileSync(`${sessionPath}/prompt/memory.md`).toString()
                            .replace(/\${system}/gi, JSON.stringify(fs.readFileSync(`${sessionPath}/prompt/system.md`).toString()))
                            .replace(/\${content}/gi, "[" + fs.readFileSync(`${sessionPath}/reply-x.json`).toString() + "]")
                    }
                ],
                ...model[boxConfig.memorizing_model][1],
                stream: false,
                user_id: "1",
                tools: []
            });
            fs.writeFileSync(
                `${sessionPath}/reply-x.json`,
                JSON.stringify(tmp.choices[0].message)
            )
        }
    });

    // 连接关闭
    ws.on('close', () => {
        logger.debug('客户端已断开连接');
    });
});

logger.debug('WebSocket 服务端已启动');