
if (msg == ".menu") {
    reply(`
--------------------------------------
支持的功能:
.menu  .token
.check .save
++++++++++++++++++++++++++++++++++++++
需求admin权限的有:
.ban   .unban
.agree .clearExec
具体用法请在本项目仓库 menu专栏.md 中查看
--------------------------------------
ADs:
请关注Alphi的B站
请给Alphi的QQ点赞
github->chenglan41/QQ-bot
Bilibili->Alphi和橙蓝
--------------------------------------
`)
    _over_ = true;
}
else if (msg == ".token") {
    let r = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://api.deepseek.com/user/balance',
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
        }
    };

    axios(r)
        .then((response) => {
            var res = "剩余余额:\n";
            response.data.balance_infos.forEach(item => {
                res += `${item.currency} ${item.total_balance}\n`
            })
            reply(res);
        })
        .catch((error) => {
            console.log(error);
        });
    _over_ = true;
}
else if (msg == ".check") {
    reply("通信正常")
    _over_ = true;
}
else if (msg == ".save") {
    fs.writeFileSync("space.json", JSON.stringify(space))
    reply("保存成功")
    _over_ = true;
}
else if (msg.split(" ")[0] == ".ban") {
    if (data.sender != undefined && space.admin.indexOf(data.sender.user_id) != -1) {
        space.banned_user.push(parseInt(msg.split(" ")[1]))
        reply(`已将 ${msg.split(" ")[1]} 拉入黑名单`)
    }
    else {
        reply("您的权限不足")
    }
    _over_ = true;

}
else if (msg.split(" ")[0] == ".unban") {
    if (data.sender != undefined && space.admin.indexOf(data.sender.user_id) != -1) {

        if (space.banned_user.indexOf(parseInt(msg.split(" ")[1])) == -1) reply(`黑名单中没有 ${msg.split(" ")[1]}`)
        else {
            space.banned_user[space.banned_user.indexOf(parseInt(msg.split(" ")[1]))] = -1;
            reply(`已将 ${msg.split(" ")[1]} 从黑名单中除去`)
        }
    }
    else {
        reply("您的权限不足")
    }
    _over_ = true;
}
else if (msg.split(" ")[0] == ".clearExec") {
    if (data.sender != undefined && space.admin.indexOf(data.sender.user_id) != -1) {
        space.exec = [];
    }
    else {
        reply("您的权限不足")
    }
    _over_ = true;
}
else if (msg.split(" ")[0] == ".agree") {
    if (data.sender != undefined && space.admin.indexOf(data.sender.user_id) != -1) {
        try {
            if (space.exec[parseInt(msg.split(" ")[1])].type == "cmd") {
                var m = `${parseInt(msg.split(" ")[1])}队列指令的执行结果:\n${execSync(space.exec[parseInt(msg.split(" ")[1])].data,
                    {
                        encoding: 'utf-8'
                    })
                    }`;
                reply(m);
                space.content[back.type + back.id].push({
                    "role": "user",
                    "content": m
                })
            }
            else if (space.exec[parseInt(msg.split(" ")[1])].type == "writeFile") {
                fs.writeFileSync(space.exec[parseInt(msg.split(" ")[1])].path, space.exec[parseInt(msg.split(" ")[1])].data)
                reply("写入成功")
                _over_ = true;
            }
        }
        catch (e) {
            logger.debug(e)
            var m = `${parseInt(msg.split(" ")[1])}队列指令的执行结果:\n${e.toString()}`
            reply(m);
            space.content[back.type + back.id].push({
                "role": "user",
                "content": m
            })
        }
    }
    else {
        reply("您的权限不足")
        _over_ = true;
    }
}