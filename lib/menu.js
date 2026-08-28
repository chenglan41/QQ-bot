if (msg.split(" ")[0] == "#菜单") {
    reply(`#状态 #拉黑 #解除拉黑 #提示词演示
广告:
github->chenglan41/QQ-bot
Bilibili->橙蓝A`)
    _over_ = true;
}
else if (msg.split(" ")[0] == "#状态") {
    reply(`通信正常
剩余回复token:${config.completion_tokens}
剩余缓存命中token:${config.prompt_cache_hit_tokens}
剩余缓存未命中token:${config.prompt_cache_miss_tokens}`)
    _over_ = true;
}
else if (msg.split(" ")[0] == "#提示词演示") {
    var tot = 6;
    if (msg.split(" ")[1] == "" || msg.split(" ")[1] == undefined || msg.split(" ")[1] == "1") {
        reply(`该功能篇幅较长，已进行分页处理
#提示词演示 <页码>
以下所有内容均可自由修改（群内所有人均可），已配备沙箱保护，如果你弄坏了可以这样修复“删除...文件”
1.修改角色设定:“将./prompt/system.md里的内容替换为...”“向./prompt/system.md里的内容追加...”
1/${tot}`)
    }
    else if (msg.split(" ")[1] == "2") {
        reply(`2.修改记忆总结:“将./prompt/memory.md里的内容替换为...”“向./prompt/memory.md里的内容追加...”
(这里指token用量接近窗口大小时将上下文总结为记忆的逻辑，比如最简单的“将\${content}总结为记忆”，“\${content}”就是引用上下文)
2/${tot}`)
    }
    else if (msg.split(" ")[1] == "3") {
        reply(`3.清除上下文:“删除./reply-x.json”
4.调整模型:“将./config.json的model的值替换为...
(非官方模型名，请联系机器人服务器管理获取)”
3/${tot}`)
    }
    else if (msg.split(" ")[1] == "4") {
        reply(`5.调整记忆化所用模型:“将./config.json的memorizing_model的值替换为...
(非官方模型名，请联系机器人服务器管理获取)”
4/${tot}`)
    }
    else if (msg.split(" ")[1] == "5") {
        reply(`6.调整(不@的情况下)回复频率:“将./config.json的sendMust的值替换为...”(sendMust为保底回复，即不@的信息数量大于等于该值时必定回复)
“将./config.json的probability的值替换为0.xxx”(probability为回复概率)
5/${tot}`)
    }
    else if (msg.split(" ")[1] == "6") {
        reply(`7.添加保护(不稳固):“将...文件的修改权设为仅我/xxx可改”
6/${tot}`)
    }
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