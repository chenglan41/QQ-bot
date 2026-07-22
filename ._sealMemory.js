import fs from "fs"
var v = JSON.parse(fs.readFileSync("./var.json").toString())
var sealedMemory = JSON.parse(fs.readFileSync("./sealedMemory.json").toString())
Object.keys(v.TemporaryMemory).forEach(item=>{
    if(sealedMemory[item] == undefined)sealedMemory[item] = [];
    sealedMemory[item] = [...sealedMemory[item] ,...v.TemporaryMemory[item] ]
    v.TemporaryMemory[item] = [];
})
fs.writeFileSync("./var.json",JSON.stringify(v))
fs.writeFileSync("./sealedMemory.json",JSON.stringify(sealedMemory))