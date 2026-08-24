// ============================================================
// lib/agent/terminal.js
// Agent 虚拟终端管理器（基于 node-pty）
// 沙盒策略：
//   1. 每个终端的工作目录被固定在 沙盒/workspace 下
//   2. 每条命令执行前都会经过 checkCommand 危险命令检查
//   3. 输出缓冲区有上限，避免无限增长
// ============================================================

import pty from "node-pty";
import fs from "fs";
import path from "path";
import { ROOT, getSandboxRoot } from "./fsbox.js";
import { checkCommand, isValidUid, TERM_BUFFER_LIMIT } from "./config.js";

let seq = 0;
// termId -> { uid, pty, buffer, workdir, createdAt, lastAt, exited }
const terminals = new Map();

/**
 * 创建虚拟终端
 * @param {object} opts
 * @param {string} opts.uid 用户标识（沙盒归属）
 * @param {number} [opts.cols=120] 列数
 * @param {number} [opts.rows=30] 行数
 * @returns {object} { id, pid, uid, workdir }
 */
export function createProcess({ uid, cols = 120, rows = 30 } = {}) {
    if (!isValidUid(uid)) return `错误: 非法 uid(${uid})`;
    const sandboxRoot = getSandboxRoot(uid);
    const workdir = path.join(sandboxRoot, "workspace");
    fs.mkdirSync(workdir, { recursive: true });

    const termId = ++seq;
    const p = pty.spawn("cmd.exe", [], {
        name: "xterm-color",
        cols,
        rows,
        cwd: workdir,
        env: { ...process.env, PROMPT: "SBOX$G" },
    });

    const term = {
        uid,
        pty: p,
        buffer: "",
        workdir,
        createdAt: Date.now(),
        lastAt: Date.now(),
        exited: false,
    };
    terminals.set(termId, term);

    p.onData((d) => {
        term.buffer += d;
        // 缓冲区上限：超出后只保留最近一半
        if (term.buffer.length > TERM_BUFFER_LIMIT) {
            term.buffer = term.buffer.slice(-Math.floor(TERM_BUFFER_LIMIT / 2));
        }
    });
    p.onExit(() => {
        term.exited = true;
    });

    return { id: termId, pid: p.pid, uid, workdir };
}

/**
 * 关闭虚拟终端
 * @param {number} id 终端 id
 * @returns {string} "ok" 或错误信息
 */
export function removeProcess(id) {
    const term = terminals.get(id);
    if (!term) return "错误: 终端不存在";
    try {
        term.pty.kill();
    } catch (e) {
        return `错误: 关闭失败 ${e.message}`;
    } finally {
        terminals.delete(id);
    }
    return "ok";
}

/**
 * 向虚拟终端输入指令（含沙盒检查）
 * @param {number} id 终端 id
 * @param {string} command 要执行的命令
 * @returns {string} "ok" 或错误信息
 */
export function inputProcess(id, command) {
    const term = terminals.get(id);
    if (!term) return "错误: 终端不存在";
    if (term.exited) return "错误: 终端已退出，请重新创建";
    const check = checkCommand(command);
    if (check !== true) return `沙盒拦截: ${check}`;
    term.lastAt = Date.now();
    term.pty.write(command + "\r");
    return "ok";
}

/**
 * 输出虚拟终端的缓冲区（读取后清空，便于增量获取）
 * @param {number} id 终端 id
 * @returns {string} 缓冲区内容 或 错误信息
 */
export function outputProcess(id) {
    const term = terminals.get(id);
    if (!term) return "错误: 终端不存在";
    const out = term.buffer;
    term.buffer = "";
    if (!out || !out.trim()) return "(缓冲区为空)";
    return out;
}

/**
 * 获取当前 uid 下所有终端的状态（便于调试）
 * @param {string} uid
 * @returns {Array}
 */
export function listProcesses(uid) {
    const arr = [];
    for (const [id, term] of terminals.entries()) {
        if (term.uid === uid) {
            arr.push({ id, pid: term.pty.pid, workdir: term.workdir, exited: term.exited, createdAt: term.createdAt });
        }
    }
    return arr;
}

/** 清理所有终端（服务关闭时调用） */
export function killAll() {
    for (const [id, term] of terminals.entries()) {
        try {
            term.pty.kill();
        } catch (e) {
            /* ignore */
        }
        terminals.delete(id);
    }
}
