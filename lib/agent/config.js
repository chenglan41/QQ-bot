// ============================================================
// lib/agent/config.js
// Agent 沙盒配置：危险命令黑名单 + 通用限制
// 说明：终端内所有命令在执行前都会经过 checkCommand 检查，
//       命中黑名单的命令会被拒绝执行，从而避免危险操作。
// ============================================================

// 单个用户沙盒的磁盘配额（字节），默认 100MB
export const DEFAULT_MAX_SPACE = 100 * 1024 * 1024;

// 终端输出缓冲区上限（字节），超出后只保留最近的部分
export const TERM_BUFFER_LIMIT = 300 * 1024;

// 单次读取文件内容的最大字节数（避免一次性把超大文件塞给 AI）
export const READ_FILE_LIMIT = 200 * 1024;

// ------------------------------------------------------------
// 危险命令黑名单
// 每个条目: { re: 正则, msg: 拦截原因说明 }
// 注意：检查前会去掉 cmd 转义符 ^，避免 "shut^down" 之类的绕过。
// ------------------------------------------------------------
export const BLOCK_PATTERNS = [
    // ---- 系统级危险操作 ----
    { re: /\bshutdown\b/i, msg: "禁止关机/重启系统" },
    { re: /\breboot\b/i, msg: "禁止重启系统" },
    { re: /\bformat\b/i, msg: "禁止格式化磁盘" },
    { re: /\bdiskpart\b/i, msg: "禁止磁盘分区操作" },
    { re: /\bbcdedit\b/i, msg: "禁止修改系统启动配置" },
    { re: /\bbootrec\b/i, msg: "禁止系统启动修复操作" },
    { re: /\breg\s+(add|delete|copy|restore|save|unload|import)\b/i, msg: "禁止修改注册表" },
    { re: /\bnet\s+(user|localgroup|accounts|use|share|stop|start)\b/i, msg: "禁止账户/共享/服务操作" },
    { re: /\btaskkill\b/i, msg: "禁止结束进程" },
    { re: /\bsc\s+(create|delete|config|stop|start)\b/i, msg: "禁止修改系统服务" },
    { re: /\bwmic\b/i, msg: "禁止使用 wmic 管理接口" },
    { re: /\b(?:takeown|icacls|cacls|attrib)\b/i, msg: "禁止修改文件权限/属性" },
    { re: /\b(?:curl|wget|iwr|invoke-webrequest|bitsadmin|certutil)\b/i, msg: "禁止网络下载/证书类命令" },
    { re: /\bpowershell\b|\bpwsh\b/i, msg: "禁止使用 PowerShell（防混淆绕过沙盒）" },

    // ---- 删除/破坏系统关键目录 ----
    { re: /(?:rd|rmdir|del|erase)\s+\/?(?:s|q)*\s*["']?[a-zA-Z]:[\\/](?:windows|system32|program\s?files|programdata)/i, msg: "禁止删除/破坏系统目录" },

    // ---- 路径穿越与越界访问 ----
    { re: /\.\./, msg: "禁止路径穿越(..)，仅允许沙盒内相对路径" },
    { re: /[a-zA-Z]:[\\/]/, msg: "禁止访问盘符绝对路径，仅允许沙盒内相对路径" },

    // ---- 关键环境变量 ----
    { re: /\bset\s+(path|pathext|comspec|systemroot|windir|temp|tmp)\s*=/i, msg: "禁止修改关键环境变量" },

    // ---- 启动盘符根级程序 ----
    { re: /\bstart\s+[a-zA-Z]:[\\/]/i, msg: "禁止启动盘符根级程序" },
];

/**
 * 检查一条终端命令是否安全
 * @param {string} command 原始命令
 * @returns {true|string} true 表示通过；string 表示被拦截的原因
 */
export function checkCommand(command) {
    if (typeof command !== "string" || command.trim() === "") {
        return "命令不能为空";
    }
    // 去掉 cmd 转义符 ^，防 "shut^down" 绕过
    const normalized = command.replace(/\^/g, "").trim();
    for (const { re, msg } of BLOCK_PATTERNS) {
        if (re.test(normalized)) return msg;
    }
    return true;
}

/**
 * 校验 uid 是否合法（只能由字母/数字/下划线/短横线组成）
 * @param {string} uid
 * @returns {boolean}
 */
export function isValidUid(uid) {
    return typeof uid === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(uid);
}
