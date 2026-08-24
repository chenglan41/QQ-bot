
if (msg == ".menu") {
    reply(`
--------------------------------------
支持的功能:
.menu         .token
.check        .save
.agent
++++++++++++++++++++++++++++++++++++++
需求admin权限的有:
.ban          .unban
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
    if (config.baseURL.indexOf("api.deepseek.com") != -1) {
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
                var res = `
已用token:
输出消耗的总token数 ${space.completion_tokens}
命中缓存的token数 ${space.prompt_cache_hit_tokens}
未命中缓存的token数 ${space.prompt_cache_miss_tokens}
剩余余额:
`;
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
    else reply("只有接入 Deepseek官方 时支持该工具")
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
else if (msg == ".agent") {
    reply(`【AI Agent 沙盒工具】
虚拟终端(node-pty, cmd.exe):
  createProcess / inputProcess / outputProcess / removeProcess
文件系统沙盒(仅 data/{会话ID}/ 内):
  createFile / createFolder / deleteFile / deleteFolder
  getFileInfo / getFolderInfo / listDir
  readFileContent / writeFileContent
沙盒限制: 禁止关机/格式化/注册表/账户/杀进程/网络下载/
PowerShell/路径穿越/盘符绝对路径 等危险命令
详细文档见项目 AGENT.md`)
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