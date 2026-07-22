import fs from "fs"
var v = JSON.parse(fs.readFileSync("./var.json").toString())
v.TemporaryMemory = {};
fs.writeFileSync("./var.json",JSON.stringify(v))