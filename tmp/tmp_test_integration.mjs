// 集成测试：模拟 index.js 中 eval 加载 lib/tools.js 的环境，验证 Agent 工具链路
import fs from "fs";
import path from "path";
import http from "http";
import https from "https";
import { execSync } from "child_process";
import * as Agent from "./lib/agent/agent.js";
globalThis.Agent = Agent;

// ---------- 模拟 index.js 中的环境 ----------
const __dirname = process.cwd();
var back = { type: "private", id: 999001 };
var config = { space: 100 * 1024 * 1024 };
var logger = { info: () => { }, error: (e) => console.log("LOGERR", e), debug: () => { } };
var model = { ds2: [[], {}, { memory: 50000, enabled_seeing: false }] };
var boxConfig = { model: "ds2", memorizing_model: "ds2" };
function getPathSizeSync(p) {
    let total = 0;
    const st = fs.statSync(p);
    if (st.isFile()) return st.size;
    for (const name of fs.readdirSync(p)) total += getPathSizeSync(path.join(p, name));
    return total;
}
function reply(c) { console.log("REPLY:", JSON.stringify(c).slice(0, 80)); }

var tools, toolFunction;
eval(fs.readFileSync("./lib/tools.js").toString());

const results = [];
const ok = (n, c, d) => results.push(`${c ? "PASS" : "FAIL"} | ${n} | ${d || ""}`);

// ---------- 检查 tools 数组 ----------
ok("tool-count", tools.length >= 20, `count=${tools.length}`);
const names = tools.map(t => t.function.name);
for (const n of ["agentHelp", "createProcess", "removeProcess", "inputProcess", "outputProcess",
    "createFile", "createFolder", "deleteFile", "deleteFolder", "getFileInfo", "getFolderInfo",
    "listDir", "readFileContent", "writeFileContent"]) {
    ok(`has-${n}`, names.includes(n));
}

// ---------- 终端链路 ----------
const cp = JSON.parse(toolFunction.createProcess({}));
ok("createProcess-uid", cp.uid === "private999001");
ok("input-ok", toolFunction.inputProcess({ id: cp.id, command: "echo hello-agent > t.txt" }) === "ok");
await new Promise(r => setTimeout(r, 800));
const out = toolFunction.outputProcess({ id: cp.id });
ok("output-has", out.includes("hello-agent"), out.slice(0, 60).replace(/\n/g, "|"));
ok("danger-block", toolFunction.inputProcess({ id: cp.id, command: "shutdown /s" }).includes("沙盒拦截"));
ok("file-created-by-term", toolFunction.readFileContent({ path: "workspace/t.txt" }).includes("hello-agent"));
ok("remove", toolFunction.removeProcess({ id: cp.id }) === "ok");

// ---------- 文件系统链路 ----------
ok("createFile", toolFunction.createFile({ path: "docs/readme.md", content: "# doc" }) === "ok");
ok("createFolder", toolFunction.createFolder({ path: "docs/sub" }) === "ok");
ok("listDir", toolFunction.listDir({ path: "docs" }).includes("readme.md"));
ok("getFileInfo", toolFunction.getFileInfo({ path: "docs/readme.md" }).includes('"size"'));
ok("getFolderInfo", toolFunction.getFolderInfo({ path: "docs" }).includes('"folder"'));
ok("writeFileContent", toolFunction.writeFileContent({ path: "docs/readme.md", content: "# doc v2" }) === "ok");
ok("readFileContent", toolFunction.readFileContent({ path: "docs/readme.md" }) === "# doc v2");
ok("deleteFile", toolFunction.deleteFile({ path: "docs/readme.md" }) === "ok");
ok("deleteFolder", toolFunction.deleteFolder({ path: "docs" }) === "ok");
ok("traversal", toolFunction.readFileContent({ path: "../index.js" }).includes("穿越"));
ok("agentHelp", toolFunction.agentHelp({}).includes("createProcess"));

// ---------- 清理测试数据 ----------
try { fs.rmSync("./data/private999001", { recursive: true, force: true }); } catch (e) { }

console.log(results.join("\n"));
const fails = results.filter(r => r.startsWith("FAIL"));
console.log(`\n===== ${results.length - fails.length}/${results.length} PASS =====`);
if (fails.length) { console.log("FAILED:\n" + fails.join("\n")); process.exit(1); }
