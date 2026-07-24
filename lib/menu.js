if (msg == ".menu") {
    reply(`
--------------------------------------
支持的功能:
.menu   .token
.check  .count
++++++++++++++++++++++++++++++++++++++
需求admin权限的有:
.seal   .clear
.ban    .unban
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
else if (msg == ".seal") {
    if (data.sender != undefined && dync.read("admin").indexOf(data.sender.user_id) != -1) {
        var v = JSON.parse(fs.readFileSync("./var.json").toString())
        var sealedContent = JSON.parse(fs.readFileSync("./sealedContent.json").toString())
        Object.keys(v.TemporaryContent).forEach(item => {
            if (sealedContent[item] == undefined) sealedContent[item] = [];
            sealedContent[item] = [...sealedContent[item], ...v.TemporaryContent[item]]
            v.TemporaryContent[item] = [];
        })
        fs.writeFileSync("./var.json", JSON.stringify(v))
        fs.writeFileSync("./sealedContent.json", JSON.stringify(sealedContent))
        reply("记忆已封存")
    }
    else {
        reply("您的权限不足")
    }
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
else if (msg == ".clear") {
    if (data.sender != undefined && dync.read("admin").indexOf(data.sender.user_id) != -1) {
        var v = JSON.parse(fs.readFileSync("./var.json").toString())
        v.TemporaryContent = {};
        fs.writeFileSync("./var.json", JSON.stringify(v))
        reply("记忆已清除")
    }
    else {
        reply("您的权限不足")
    }
    _over_ = true;
}
else if (msg == ".count") {
    var res = 0;
    var PermanentContent = JSON.parse(fs.readFileSync("./sealedContent.json").toString())
    Object.keys(PermanentContent).forEach(item => {
        res += PermanentContent[item].length;
    })
    reply(`${res} 条信息被封存`)
    _over_ = true;
}
else if (msg.split(" ")[0] == ".ban") {
    if (data.sender != undefined && dync.read("admin").indexOf(data.sender.user_id) != -1) {
        dync.change("banned_user", (tm) => {
            tm.push(parseInt(msg.split(" ")[1]))
            return tm;
        })
        reply(`已将 ${msg.split(" ")[1]} 拉入黑名单`)
    }
    else {
        reply("您的权限不足")
    }
    _over_ = true;

}
else if (msg.split(" ")[0] == ".unban") {
    if (data.sender != undefined && dync.read("admin").indexOf(data.sender.user_id) != -1) {

        dync.change("banned_user", (tm) => {
            if (tm.indexOf(parseInt(msg.split(" ")[1])) == -1) reply(`黑名单中没有 ${msg.split(" ")[1]}`)
            else {
                tm[tm.indexOf(parseInt(msg.split(" ")[1]))] = -1;
                reply(`已将 ${msg.split(" ")[1]} 从黑名单中除去`)
            }
            return tm;
        })
    }
    else {
        reply("您的权限不足")
    }
    _over_ = true;
}
else if (msg.split(" ")[0] == ".agree") {
    if (data.sender != undefined && dync.read("admin").indexOf(data.sender.user_id) != -1) {
        try {
            if (dync.read("exec")[parseInt(msg.split(" ")[1])].type == "cmd") {
                dync.change("TemporaryContent", (tm) => {
                    var m = `${parseInt(msg.split(" ")[1])}队列指令的执行结果:\n${execSync(dync.read("exec")[parseInt(msg.split(" ")[1])].data,
                        {
                            encoding: 'utf-8'
                        })
                        }`;
                    if (tm[back.type + back.id] == undefined) tm[back.type + back.id] = [];
                    reply(m);
                    tm[back.type + back.id].push({
                        "role": "user",
                        "content": m
                    })
                    return tm;
                });
            }
            else if (dync.read("exec")[parseInt(msg.split(" ")[1])].type == "writeFile") {
                fs.writeFileSync(dync.read("exec")[parseInt(msg.split(" ")[1])].path,dync.read("exec")[parseInt(msg.split(" ")[1])].data)
                reply("写入成功")
                _over_ = true;
            }
        }
        catch (e) {
            logger.debug(e)
            dync.change("TemporaryContent", (tm) => {
                if (tm[back.type + back.id] == undefined) tm[back.type + back.id] = [];
                var m = `${parseInt(msg.split(" ")[1])}队列指令的执行结果:\n${e.toString()}`
                reply(m);
                tm[back.type + back.id].push({
                    "role": "user",
                    "content": m
                })
                return tm;
            });
        }
    }
    else {
        reply("您的权限不足")
        _over_ = true;
    }
}