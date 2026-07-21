import fs from "fs"
const dync = {
    "set": (key, value) => {
        var data = JSON.parse(fs.readFileSync("./var.json").toString());
        data[key] = value;
        fs.writeFileSync("./var.json", JSON.stringify(data));
    },
    "change": (key, callback) => {
        var data = JSON.parse(fs.readFileSync("./var.json").toString());
        data[key] = callback(data[key]);
        fs.writeFileSync("./var.json", JSON.stringify(data));
    },
    "read": (key) => {
        var data = JSON.parse(fs.readFileSync("./var.json").toString());
        return data[key];
    }
};
export {dync}