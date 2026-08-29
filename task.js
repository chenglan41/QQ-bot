// 自动找话题模块
// 每个会话记录最后活跃时间，超过 topicInterval 毫秒空闲则自动发起话题
// 注意：这个文件会被 index.js 的 setInterval 定时 eval 执行
/**
 * 检查当前时间是否在允许自动话题的时间段内
 * 默认：早上8点到晚上23点（晚上不打扰）
 * @returns {boolean}
 */
function isAllowedTime() {
    var now = new Date();
    var hour = now.getHours();
    // 可配置：通过 config.topicStartHour 和 config.topicEndHour 控制
    var startHour = config.topicStartHour !== undefined ? config.topicStartHour : 8;
    var endHour = config.topicEndHour !== undefined ? config.topicEndHour : 23;
    return hour >= startHour && hour < endHour;
}

/**
 * 检查所有会话是否需要触发自动话题
 */
async function checkAndAutoTopic() {
    // 先检查时间，不在允许时间段内直接跳过
    if (!isAllowedTime()) {
        return;
    }
    var sessions = fs.readdirSync("./data");
    var topicInterval = config.topicInterval || 1800000; // 默认30分钟
    var now = Date.now();
    for (var sessionId of sessions) {
        if (sessionId == "default") continue; // 跳过模板
        if (topicLock[sessionId]) continue; // 正在生成话题中，跳过
        var lastActive = topicLastActive[sessionId];
        if (lastActive == undefined) {
            topicLastActive[sessionId] = now;
            continue;
        }
        // 还没到空闲时间
        if (now - lastActive < topicInterval) continue;
        var sessionPath = `./data/${sessionId}`;
        // 锁定，防止重复触发
        topicLock[sessionId] = true;
        try {
            // 解析会话类型和ID
            var type = sessionId.startsWith("group") ? "group" : "private";
            var id = sessionId.substring(type.length);
            // 读取会话的 config.json 获取模型配置
            ensureConfigJson(sessionPath)
            var boxConfig = JSON.parse(fs.readFileSync(`${sessionPath}/config.json`).toString());

            // 检查 topic.md 是否存在
            ensurePromptDir(sessionPath);
            ensurePromptFile(sessionPath, "topic.md");
            ensurePromptFile(sessionPath, "system.md");
            ensureReplyXJson(sessionPath);
            ensureBoxConfigFields(boxConfig)
            // 构建话题生成请求
            var openai = new OpenAI(model[boxConfig.model][0]);
            var question = await openai.chat.completions.create({
                messages: [
                    {
                        "role": "system",
                        "content": fs.readFileSync(`${sessionPath}/prompt/system.md`).toString()
                    },
                    ...JSON.parse("[" + fs.readFileSync(`${sessionPath}/reply-x.json`, { flag: "a+" }).toString() + "]"),
                    {
                        "role": "system",
                        "content": fs.readFileSync(`${sessionPath}/prompt/topic.md`).toString()
                    }
                ],
                ...model[boxConfig.model][1],
                stream: false,
                user_id: "1",
                tools: []
            });

            var content = question.choices[0].message.content;
            if (content && content.trim()) {
                // 发送话题消息
                if (type == "group") {
                    ws.send(JSON.stringify({
                        "action": "send_group_msg",
                        "params": {
                            "group_id": id,
                            "message": [
                                { type: 'text', data: { text: content } }
                            ]
                        },
                        "echo": ""
                    }));
                } else {
                    ws.send(JSON.stringify({
                        "action": "send_private_msg",
                        "params": {
                            "user_id": id,
                            "message": content
                        },
                        "echo": ""
                    }));
                }
                logger.info(`[自动话题] ${sessionId}: ${content}`);

                // 把话题消息写入 reply-x.json，作为记忆
                var topicMsg = JSON.stringify({
                    role: "assistant",
                    content: content
                });
                var stat = fs.statSync(replyXPath);
                fs.writeFileSync(
                    replyXPath,
                    (stat.size == 0 ? "" : ",\n") + topicMsg,
                    { flag: "a+" }
                );
            }

            // 更新活跃时间，防止连续触发
            topicLastActive[sessionId] = Date.now();

        } catch (e) {
            logger.error(`[自动话题] ${sessionId} 错误: ${e.message}`);
        } finally {
            // 解锁
            topicLock[sessionId] = false;
        }
    }
}

// 执行检查
checkAndAutoTopic();