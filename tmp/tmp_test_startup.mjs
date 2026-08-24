// 启动测试：验证 index.js 能否正常启动（加载 agent 模块、创建 ws 服务）
import { spawn } from "child_process";

const p = spawn("node", ["."], { cwd: process.cwd(), shell: false });
let out = "";
p.stdout.on("data", d => out += d.toString());
p.stderr.on("data", d => out += d.toString());
p.on("exit", c => { console.log("EXIT CODE:", c); });

setTimeout(() => {
    console.log("===== STARTUP OUTPUT =====");
    console.log(out.slice(0, 4000));
    try { p.kill(); } catch (e) { }
    setTimeout(() => process.exit(0), 500);
}, 5000);
