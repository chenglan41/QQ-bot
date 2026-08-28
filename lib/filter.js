filter = (back, msg, at) => {
    if (back.type == undefined) return false;
    else if(data.sender == undefined || config.banned_user.indexOf(data.sender.user_id) != -1)return false;
    else if(back.type == "private")return true;
    else if(back.type == "group" && 
        execSync(`node lib/get_group_shut_list.js ${config.httpPort} ${config.httpToken} ${back.id}`).indexOf(config.uid) != -1
    ){
        return false;
    }
    else if (at.length > 0) {
        if(at.indexOf(config.uid) == -1)return false;
        else return true;
    }
    else if (back.type == "group" && sendMust[back.type + back.id] >= config.sendMust) {
        sendMust[back.type + back.id] = 0;
        return true;
    }
    else if (back.type == "group" && Math.random() >= config.probability) {
        sendMust[back.type + back.id]++;
        return false;
    }
    else if(sendMust[back.type + back.id] < 0)return false;
    else return true;
};