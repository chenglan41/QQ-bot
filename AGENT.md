# AI Agent 沙盒工具文档

基于 node-pty 的虚拟终端 + 沙盒文件系统，让机器人具备真正的「动手能力」：可以在沙盒内执行命令、读写文件，并且**有工具调用时自动触发下一轮询问**（Agent 多轮循环），直到 AI 给出最终回答。

## 多轮询问机制（Agent 循环）

`index.js` 中的询问器已改写为 **Agent 循环**：

1. 用户发消息 → 组装 prompt 发给 AI
2. AI 返回 `tool_calls`（要调用工具）→ **自动执行工具**，把结果发回给 AI
3. AI 根据结果继续思考，可能再次调用工具，或给出最终回答
4. 直到 AI 不再调用工具（返回纯文本回答）→ 回复用户，循环结束
5. 兜底：单条消息最多循环 **10 轮**（`index.js` 中 `MAX_AGENT_ROUNDS` 常量，可按需调整），防止 AI 无限调用工具

特点：
- AI 调用多个工具时会**全部执行**，结果一起发回下一轮
- 执行工具期间 AI 的「过程说明」（如果返回了非空文本）会先发给用户，避免等待时静默
- 工具结果会作为 `tool` 消息随上下文写入 `reply-x.json`，成为长期记忆的一部分
- 每轮都会做 token 统计；总上下文超限后仍会触发记忆化压缩
## 沙盒机制

每个会话（back.type + back.id，如 private12345）有独立沙盒目录：

    data/{会话ID}/
    +-- workspace/        # 虚拟终端工作目录（cmd.exe 启动位置）
    +-- ...               # 通过工具创建的文件/文件夹

- 文件操作只能访问本会话沙盒内，拒绝绝对路径与 .. 穿越
- 默认配额：总空间 100MB、终端缓冲区上限 300KB、单文件读取上限 200KB（可改 lib/agent/config.js）
- 危险命令黑名单：shutdown/reboot/format/diskpart/bcdedit/bootrec/reg/net/taskkill/sc/wmic/takeown/icacls/attrib/curl/wget/iwr 等（执行前先去掉 ^ 转义符防绕过）
## 工具列表

### 终端（虚拟 cmd.exe）
| 工具 | 说明 | 必填参数 |
|---|---|---|
| createProcess | 创建虚拟终端，返回 {id,pid,uid,workdir} | 无 |
| removeProcess | 关闭终端 | id |
| inputProcess | 向终端输入命令（自动回车） | id, command |
| outputProcess | 读取终端输出（读后清空） | id |

### 文件系统（沙盒内）
| 工具 | 说明 | 必填参数 |
|---|---|---|
| createFile | 创建文件（覆盖，自动建父目录） | path |
| createFolder | 创建文件夹 | path |
| deleteFile | 删除文件 | path |
| deleteFolder | 递归删除文件夹（不可删沙盒根） | path |
| getFileInfo | 文件状态（大小/时间） | path |
| getFolderInfo | 文件夹状态（总大小/文件数） | path |
| listDir | 列出文件夹内文件列表 | 无（默认 .） |
| readFileContent | 读取文件内容（过大截断） | path |
| writeFileContent | 覆盖写入文件 | path, content |

### 辅助
| 工具 | 说明 |
|---|---|
| agentHelp | 获取本套工具的完整使用说明 |

> uid 参数对所有 Agent 工具都可选（默认当前会话），一般无需传。
## 快速体验

群里或私聊对机器人说一句：

    帮我在沙盒里建个文件夹 test，写个 hello.txt 进去，然后用终端看看目录

AI 会依次调用 createFolder、writeFileContent、createProcess/inputProcess/outputProcess，并把最终结果告诉你。
