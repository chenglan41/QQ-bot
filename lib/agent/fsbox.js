// ============================================================
// lib/agent/fsbox.js
// Agent 文件系统沙盒
// 每个 uid 只能访问 QQ-bot/data/{uid}/ 目录下的内容，
// 一切路径都会被校验，防止路径穿越（..）与盘符越界访问。
// ============================================================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { isValidUid, DEFAULT_MAX_SPACE, READ_FILE_LIMIT } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// QQ-bot 项目根目录（lib/agent -> lib -> 根）
export const ROOT = path.resolve(__dirname, "..", "..");

/**
 * 获取某个 uid 的沙盒根目录（QQ-bot/data/{uid}）
 * 目录不存在时自动创建
 * @param {string} uid
 * @returns {string} 沙盒根目录的绝对路径
 */
export function getSandboxRoot(uid) {
    if (!isValidUid(uid)) throw new Error(`非法 uid: ${uid}`);
    const root = path.join(ROOT, "data", uid);
    fs.mkdirSync(root, { recursive: true });
    return root;
}

/**
 * 将相对路径安全地解析为沙盒内的绝对路径
 * 校验：拒绝绝对路径、拒绝 .. 穿越、确保解析结果仍在沙盒根内
 * @param {string} uid
 * @param {string} rel 相对路径（可含子目录，/ 或 \ 均可）
 * @returns {string} 沙盒内的绝对路径
 */
export function resolveSafePath(uid, rel) {
    if (typeof rel !== "string" || rel.trim() === "") throw new Error("路径不能为空");
    const root = getSandboxRoot(uid);
    // 统一为 / 并去掉首尾空白
    let p = rel.replace(/\\/g, "/").trim();
    // 拒绝绝对路径 / 盘符
    if (p.startsWith("/") || /^[a-zA-Z]:/.test(p)) throw new Error("不允许绝对路径");
    // 拆分并过滤 . 与空段
    const parts = p.split("/").filter((x) => x && x !== ".");
    // 拒绝 ..
    if (parts.some((x) => x === "..")) throw new Error("不允许路径穿越(..)");
    const realRoot = path.resolve(root);
    const realTarget = path.resolve(realRoot, ...parts);
    if (realTarget !== realRoot && !realTarget.startsWith(realRoot + path.sep)) {
        throw new Error("路径越界，禁止访问沙盒外");
    }
    return realTarget;
}

/**
 * 计算一个路径（文件或目录）占用的总字节数
 * @param {string} p
 * @returns {number}
 */
function dirSize(p) {
    let total = 0;
    const st = fs.statSync(p);
    if (st.isFile()) return st.size;
    for (const name of fs.readdirSync(p)) {
        total += dirSize(path.join(p, name));
    }
    return total;
}

/**
 * 检查沙盒剩余空间是否足够写入 length 字节
 * @param {string} uid
 * @param {number} length
 * @param {number} [maxSpace]
 */
export function checkSpace(uid, length, maxSpace = DEFAULT_MAX_SPACE) {
    const root = getSandboxRoot(uid);
    const used = dirSize(root);
    if (used + length > maxSpace) {
        throw new Error(`沙盒空间不足（配额 ${Math.floor(maxSpace / 1024 / 1024)}MB，已用 ${Math.floor(used / 1024 / 1024)}MB）`);
    }
    return true;
}

/**
 * 统一把返回值 / 错误转成字符串（便于塞给 AI 的 tool 消息）
 * @param {Function} fn
 * @returns {string}
 */
function safe(fn) {
    try {
        const r = fn();
        return typeof r === "string" ? r : JSON.stringify(r);
    } catch (e) {
        return `错误: ${e.message}`;
    }
}

// ------------------------------------------------------------
// 对外工具函数（每个都返回字符串）
// ------------------------------------------------------------

/** 创建文件（若已存在则覆盖；父目录不存在会自动创建） */
export function createFile(uid, rel, content = "") {
    return safe(() => {
        if (typeof content !== "string") content = String(content);
        const target = resolveSafePath(uid, rel);
        if (fs.existsSync(target) && fs.statSync(target).isDirectory()) throw new Error("目标是一个文件夹");
        checkSpace(uid, Buffer.byteLength(content, "utf8"));
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, content, "utf8");
        return "ok";
    });
}

/** 创建文件夹（已存在则返回 ok） */
export function createFolder(uid, rel) {
    return safe(() => {
        const target = resolveSafePath(uid, rel);
        if (fs.existsSync(target)) {
            if (!fs.statSync(target).isDirectory()) throw new Error("目标已存在且不是文件夹");
            return "ok（已存在）";
        }
        fs.mkdirSync(target, { recursive: true });
        return "ok";
    });
}

/** 删除文件 */
export function deleteFile(uid, rel) {
    return safe(() => {
        const target = resolveSafePath(uid, rel);
        if (!fs.existsSync(target)) return "错误: 文件不存在";
        if (fs.statSync(target).isDirectory()) throw new Error("目标是文件夹，请用删除文件夹");
        fs.unlinkSync(target);
        return "ok";
    });
}

/** 删除文件夹（递归删除其中所有内容，仅限沙盒内） */
export function deleteFolder(uid, rel) {
    return safe(() => {
        const target = resolveSafePath(uid, rel);
        const root = getSandboxRoot(uid);
        if (path.resolve(target) === path.resolve(root)) throw new Error("不允许删除沙盒根目录");
        if (!fs.existsSync(target)) return "错误: 文件夹不存在";
        if (!fs.statSync(target).isDirectory()) throw new Error("目标是文件，请用删除文件");
        fs.rmSync(target, { recursive: true, force: true });
        return "ok";
    });
}

/** 读取文件夹状态数据（stat 信息） */
export function getFolderInfo(uid, rel) {
    return safe(() => {
        const target = resolveSafePath(uid, rel);
        if (!fs.existsSync(target)) return "错误: 文件夹不存在";
        const st = fs.statSync(target);
        if (!st.isDirectory()) throw new Error("目标是文件");
        return {
            type: "folder",
            path: rel,
            size: dirSize(target),
            fileCount: fs.readdirSync(target).length,
            createdAt: st.birthtime,
            modifiedAt: st.mtime,
            isDirectory: true,
        };
    });
}

/** 读取文件状态数据（stat 信息） */
export function getFileInfo(uid, rel) {
    return safe(() => {
        const target = resolveSafePath(uid, rel);
        if (!fs.existsSync(target)) return "错误: 文件不存在";
        const st = fs.statSync(target);
        if (!st.isFile()) throw new Error("目标是文件夹");
        return {
            type: "file",
            path: rel,
            size: st.size,
            createdAt: st.birthtime,
            modifiedAt: st.mtime,
            isFile: true,
        };
    });
}

/** 读取文件夹内的文件/文件夹列表 */
export function listDir(uid, rel = ".") {
    return safe(() => {
        const target = resolveSafePath(uid, rel);
        if (!fs.existsSync(target)) return "错误: 文件夹不存在";
        if (!fs.statSync(target).isDirectory()) throw new Error("目标是文件");
        const items = fs.readdirSync(target, { withFileTypes: true }).map((d) => ({
            name: d.name,
            type: d.isDirectory() ? "folder" : "file",
        }));
        return { path: rel, items };
    });
}

/** 读取文件内容（超过 READ_FILE_LIMIT 会截断并提示） */
export function readFileContent(uid, rel) {
    return safe(() => {
        const target = resolveSafePath(uid, rel);
        if (!fs.existsSync(target)) return "错误: 文件不存在";
        if (fs.statSync(target).isDirectory()) throw new Error("目标是文件夹");
        const st = fs.statSync(target);
        if (st.size > READ_FILE_LIMIT) {
            const buf = fs.readFileSync(target);
            return buf.subarray(0, READ_FILE_LIMIT).toString("utf8") +
                `\n...(文件过大，已截断前 ${READ_FILE_LIMIT} 字节，完整大小 ${st.size} 字节，可分段读取)`;
        }
        return fs.readFileSync(target, "utf8");
    });
}

/** 写入文件（覆盖式；父目录不存在会自动创建） */
export function writeFileContent(uid, rel, content) {
    return createFile(uid, rel, content);
}
