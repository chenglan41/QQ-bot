filter = (back, msg, at) => {
    if (back.type == undefined || msg == "" || msg == " ") return false;
    else if(data.sender != undefined && space.banned_user.indexOf(data.sender.user_id) != -1)return false;
    else if(back.type == "group" && 
        execSync(`node lib/get_group_shut_list.js ${config.httpPort} ${config.httpToken} ${back.id}`).indexOf(config.uid) != -1
    ){
        return false;
    }
    else if (at.length > 0 && at.indexOf(config.uid) != -1) return true;
    else if (back.type == "group" && sendMust >= config.sendMust) {
        sendMust = 0;
        return true;
    }
    else if (back.type == "group" && Math.random() >= config.probability) {
        sendMust++;
        return false;
    }
    else return true;
};