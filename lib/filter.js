var banned_user = []
filter = (back, msg, at) => {
    if (back.type == undefined || msg == "" || dync.read("link")[ws.id] == false) return false;
    else if(data.sender != undefined && banned_user.indexOf(data.sender.user_id) != -1)return false;
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