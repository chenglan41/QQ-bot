import fs from "fs"
var res = 0;
var PermanentMemory = JSON.parse(fs.readFileSync("./PermanentMemory.json").toString())
Object.keys( PermanentMemory).forEach(item=>{
    res +=PermanentMemory[item].length;
})
console.log(res)