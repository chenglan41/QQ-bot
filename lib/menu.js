if(msg == ".menu"){
reply(`
支持的功能:
.menu   .token
.check
具体用法请在本项目仓库 menu专栏.md 中查看
ADs:
github->chenglan41/QQ-bot
Bilibili->Alphi和橙蓝
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
            response.data.balance_infos.forEach(item=>{
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