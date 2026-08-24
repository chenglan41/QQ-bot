// ============================================================
// lib/agent/agent.js
// Agent 统一入口
// 汇集虚拟终端管理器(node-pty) 与 文件系统沙盒 的所有工具，
// 供 lib/tools.js 通过 "Agent.xxx" 调用。
// 所有工具函数均返回字符串（JSON 或纯文本），便于直接塞给 AI。
// ============================================================

import * as Terminal from "./terminal.js";
import * as FsBox from "./fsbox.js";
import { checkCommand, isValidUid, DEFAULT_MAX_SPACE, TERM_BUFFER_LIMIT, READ_FILE_LIMIT } from "./config.js";

// 统一把返回值转成字符串
const toStr = (r) => (typeof r === "string" ? r : JSON.stringify(r));

// ---- 虚拟终端 ----
export const createProcess = (val) => {
    if (!val) return "错误: 缺少参数";
    return toStr(Terminal.createProcess(val));
};
export const removeProcess = (val) => {
    if (!val || val.id === undefined) return "错误: 缺少终端 id";
    return Terminal.removeProcess(val.id);
};
export const inputProcess = (val) => {
    if (!val || val.id === undefined || val.command === undefined) return "错误: 缺少终端 id 或 command";
    return Terminal.inputProcess(val.id, val.command);
};
export const outputProcess = (val) => {
    if (!val || val.id === undefined) return "错误: 缺少终端 id";
    return Terminal.outputProcess(val.id);
};

// ---- 文件系统（沙盒）----
export const createFile = (uid, val) => {
    if (!val || !val.path) return "错误: 缺少 path";
    return FsBox.createFile(uid, val.path, val.content);
};
export const createFolder = (uid, val) => {
    if (!val || !val.path) return "错误: 缺少 path";
    return FsBox.createFolder(uid, val.path);
};
export const deleteFile = (uid, val) => {
    if (!val || !val.path) return "错误: 缺少 path";
    return FsBox.deleteFile(uid, val.path);
};
export const deleteFolder = (uid, val) => {
    if (!val || !val.path) return "错误: 缺少 path";
    return FsBox.deleteFolder(uid, val.path);
};
export const getFolderInfo = (uid, val) => {
    if (!val || !val.path) return "错误: 缺少 path";
    return FsBox.getFolderInfo(uid, val.path);
};
export const getFileInfo = (uid, val) => {
    if (!val || !val.path) return "错误: 缺少 path";
    return FsBox.getFileInfo(uid, val.path);
};
export const listDir = (uid, val) => {
    return FsBox.listDir(uid, val && val.path !== undefined ? val.path : ".");
};
export const readFileContent = (uid, val) => {
    if (!val || !val.path) return "错误: 缺少 path";
    return FsBox.readFileContent(uid, val.path);
};
export const writeFileContent = (uid, val) => {
    if (!val || !val.path) return "错误: 缺少 path";
    return FsBox.writeFileContent(uid, val.path, val.content);
};

// ---- 帮助说明 ----
export function help() {
    return `【AI Agent 沙盒工具说明】
一、虚拟终端（node-pty，工作目录=沙盒/workspace，cmd.exe）
  createProcess  创建终端，参数 { uid? , cols?, rows? }，返回终端 id
  inputProcess   输入命令，参数 { id, command }
  outputProcess  读取并清空终端缓冲区，参数 { id }
  removeProcess  关闭终端，参数 { id }
  沙盒限制：禁止关机/格式化/改注册表/改账户/杀进程/网络下载/PowerShell/路径穿越(..)/盘符绝对路径 等危险命令。
二、文件系统（仅能操作 QQ-bot/data/{uid}/ 内，{uid} 默认=当前会话ID）
  createFile     创建/覆盖文件 { path, content? }
  createFolder   创建文件夹 { path }
  deleteFile     删除文件 { path }
  deleteFolder   删除文件夹 { path }
  getFileInfo    文件状态 { path }
  getFolderInfo  文件夹状态 { path }
  listDir        列目录 { path? }
  readFileContent 读文件 { path }
  writeFileContent 写文件 { path, content }
  沙盒限制：拒绝 .. 路径穿越与绝对路径；每用户配额 ${Math.floor(DEFAULT_MAX_SPACE / 1024 / 1024)}MB。
三、路径均使用沙盒内相对路径（如 "a/b.txt"）。`;
}

/** 简单自检：确认模块可用 */
export function selfTest() {
    return {
        ok: true,
        checkCommand: typeof checkCommand,
        isValidUid: typeof isValidUid,
        terminalBufferLimit: TERM_BUFFER_LIMIT,
        readFileLimit: READ_FILE_LIMIT,
    };
}
