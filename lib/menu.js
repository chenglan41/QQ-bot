if (msg.split(" ")[0] == "#菜单") {
    reply(`#状态 #拉黑 #解除拉黑 #提示词演示
广告:
github->chenglan41/QQ-bot
Bilibili->橙蓝A`)
    _over_ = true;
}
else if (msg == "#状态") {
    reply(`通信正常\n剩余回复token:${config.completion_tokens}\n剩余缓存命中token:${config.prompt_cache_hit_tokens}\n剩余缓存未命中token:${config.prompt_cache_miss_tokens}`)
    _over_ = true;
}
else if (msg == "#提示词演示") {
    reply(``)
    _over_ = true;
}
else if (msg.split(" ")[0] == "#拉黑") {
    if (msg.split(" ")[1] == "" || msg.split(" ")[1] == undefined) reply("(需要机器人管理员权限)请按照以下格式发送:\n#封禁 <QQ号>")
    else if (data.sender != undefined && config.admin.indexOf(data.sender.user_id) != -1) {
        if (config.admin.indexOf(parseInt(msg.split(" ")[1])) != -1) reply("不能拉黑机器人管理员");
        else {
            config.banned_user.push(parseInt(msg.split(" ")[1]))
            reply(`已将 ${msg.split(" ")[1]} 拉入黑名单(仅禁止AI对话)`)
            fs.writeFileSync("./config.json", JSON.stringify(config));
        }
    }
    else {
        reply("您的权限不足")
    }
    _over_ = true;
}

else if (msg.split(" ")[0] == "#解除拉黑") {
    if (msg.split(" ")[1] == "" || msg.split(" ")[1] == undefined) reply("(需要机器人管理员权限)请按照以下格式发送:\n#封禁 <QQ号>")
    else if (data.sender != undefined && config.admin.indexOf(data.sender.user_id) != -1) {
        if (config.banned_user.indexOf(parseInt(msg.split(" ")[1])) == -1) reply(`(需要机器人管理员权限)黑名单中没有 ${msg.split(" ")[1]}`)
        else {
            config.banned_user[config.banned_user.indexOf(parseInt(msg.split(" ")[1]))] = -1;
            reply(`已将 ${msg.split(" ")[1]} 从黑名单中除去`)
        }
    }
    else {
        reply("您的权限不足")
    }
    _over_ = true;
}