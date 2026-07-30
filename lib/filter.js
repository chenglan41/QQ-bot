filter = (back, msg, at) => {
    if (back.type == undefined || msg == "" || msg == " ") return false;
    else if(data.sender == undefined || space.banned_user.indexOf(data.sender.user_id) != -1)return false;
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
    else if (back.type == "group" && space.sendMust[back.type + back.id] >= config.sendMust) {
        space.sendMust[back.type + back.id] = 0;
        return true;
    }
    else if (back.type == "group" && Math.random() >= config.probability) {
        space.sendMust[back.type + back.id]++;
        return false;
    }
    else if(space.sendMust[back.type + back.id] < 0)return false;
    else return true;
};