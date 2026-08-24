// 模拟 index.js 询问器循环：验证「AI 有工具调用时自动触发下一轮询问」
// 用 stub OpenAI 响应序列模拟多轮工具调用，跑真实 lib/tools.js
import fs from "fs";
import { execSync } from "child_process";
import * as Agent from "../lib/agent/agent.js";
globalThis.Agent = Agent;

let pass = 0, fail = 0;
function check(name, cond, extra = "") {
    if (cond) { pass++; console.log("PASS | " + name + " | " + extra); }
    else { fail++; console.log("FAIL | " + name + " | " + extra); }
}

// ---- stub OpenAI 响应序列（模拟 DeepSeek 返回）----
// 第 1 轮：同时调用 2 个工具（time + createFile）
// 第 2 轮：调用 1 个工具（listDir）
// 第 3 轮：最终回答（无工具调用）
const stubResponses = [
    {
        choices: [{
            message: {
                role: "assistant",
                content: "我来查一下时间并建个文件~",
                tool_calls: [
                    { id: "call_1", type: "function", function: { name: "time", arguments: "{}" } },
                    { id: "call_2", type: "function", function: { name: "createFile", arguments: '{"uid":"test_loop","path":"hello.txt","content":"hi from agent"}' } }
                ]
            }
        }],
        usage: { completion_tokens: 20, prompt_cache_hit_tokens: 10, prompt_cache_miss_tokens: 90, total_tokens: 120 }
    },
    {
        choices: [{
            message: {
                role: "assistant",
                content: "再看下文件列表~",
                tool_calls: [
                    { id: "call_3", type: "function", function: { name: "listDir", arguments: '{"uid":"test_loop","path":"."}' } }
                ]
            }
        }],
        usage: { completion_tokens: 10, prompt_cache_hit_tokens: 10, prompt_cache_miss_tokens: 190, total_tokens: 210 }
    },
    {
        choices: [{
            message: {
                role: "assistant",
                content: "完成啦！文件已经建好咯~",
                tool_calls: undefined
            }
        }],
        usage: { completion_tokens: 15, prompt_cache_hit_tokens: 10, prompt_cache_miss_tokens: 260, total_tokens: 285 }
    }
];

// ---- 与 index.js 相同的询问器循环逻辑 ----
const prompt = [];
prompt.push({ role: "user", content: "帮我建个文件" });
const replies = [];
let apiCalls = 0;
const MAX_AGENT_ROUNDS = 10;
let lastUsage = null;
for (let i = 0; i < MAX_AGENT_ROUNDS; i++) {
    let tools, toolFunction;
    eval(fs.readFileSync("./lib/tools.js").toString());
    const question = stubResponses[apiCalls];
    apiCalls++;
    if (question.choices == undefined) break;
    const message = question.choices[0].message;
    prompt.push(message);
    if (question.usage != undefined) lastUsage = question.usage;
    // 无工具调用：最终回答
    if (message.tool_calls == undefined || message.tool_calls.length == 0) {
        replies.push(message.content);
        break;
    }
    // 有工具调用：过程说明 + 执行工具
    if (message.content != undefined && message.content != "") replies.push("[过程] " + message.content);
    let hasToolResult = false;
    message.tool_calls.forEach(item => {
        let tmp = "";
        if (toolFunction[item.function.name] != undefined) {
            try { tmp = toolFunction[item.function.name](JSON.parse(item.function.arguments)); }
            catch (e) { tmp = e.toString(); }
        } else { tmp = `错误: 未知工具 ${item.function.name}`; }
        if (tmp == "skip") return;
        prompt.push({ role: "tool", tool_call_id: item.id, content: typeof tmp == "string" ? tmp : "" });
        hasToolResult = true;
    });
    if (hasToolResult == false) break;
    // 继续下一轮询问
}

// ---- 断言 ----
const toolMsgs = prompt.filter(m => m.role == "tool");
const assistantMsgs = prompt.filter(m => m.role == "assistant");

check("API 被询问 3 轮（2 次工具 + 1 次最终回答）", apiCalls === 3, "apiCalls=" + apiCalls);
check("最终回答被 reply", replies.some(r => r == "完成啦！文件已经建好咯~"), JSON.stringify(replies));
check("过程说明被 reply（2 条）", replies.filter(r => r.startsWith("[过程]")).length === 2, JSON.stringify(replies));
check("prompt 含 3 条 assistant 消息", assistantMsgs.length === 3, "assistant=" + assistantMsgs.length);
check("prompt 含 3 条 tool 结果消息", toolMsgs.length === 3, "tool=" + toolMsgs.length);
check("tool 消息带 tool_call_id", toolMsgs.every(m => m.tool_call_id != undefined));
check("时间工具结果已写入", toolMsgs[0].content.length > 0 && !toolMsgs[0].content.startsWith("错误"), toolMsgs[0].content);
check("建文件结果已写入", toolMsgs[1].content == "ok", toolMsgs[1].content);
check("列表结果已写入且含新文件", toolMsgs[2].content.includes("hello.txt"), toolMsgs[2].content);
check("记忆化阈值判断值已记录", lastUsage != null && lastUsage.total_tokens === 285, "total_tokens=" + (lastUsage && lastUsage.total_tokens));
check("沙盒内文件真实存在", fs.existsSync("data/test_loop/hello.txt"), "data/test_loop/hello.txt");

// ---- 清理测试数据 ----
try { fs.rmSync("data/test_loop", { recursive: true, force: true }); } catch (e) { }

console.log(`\n===== ${pass}/${pass + fail} PASS =====`);
process.exit(fail > 0 ? 1 : 0);
