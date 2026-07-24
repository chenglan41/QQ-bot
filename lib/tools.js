tools = [
    // {
    //     "type": "function",
    //     "function": {
    //         "name": "函数名",
    //         "description": "简介",
    //         "parameters": {
    //             "type": "object",
    //             "properties": {
    //                 "参数名": {
    //                     "type": "参数类型",
    //                     "description": "参数描述",
    //                 }
    //             },
    //             "required": ["必须传入的参数"]
    //         },
    //     }
    // },
    {
        "type": "function",
        "function": {
            "name": "https",
            "description": "访问https网页",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "网页url,必须以`https://`开头",
                    }
                },
                "required": ["url"]
            },
        }
    },
    {
        "type": "function",
        "function": {
            "name": "http",
            "description": "访问http网页",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "网页url,必须以`http://`开头",
                    }
                },
                "required": ["url"]
            },
        }
    },
    {
        "type": "function",
        "function": {
            "name": "time",
            "description": "获取当前时间",
            "parameters": {
                "type": "object",
                "properties": {
                },
                "required": []
            },
        }
    },
    {
        "type": "function",
        "function": {
            "name": "emotion",
            "description": "发送表情，返回发送状态",
            "parameters": {
                "type": "object",
                "properties": {
                    "emotion": {
                        "type": "string",
                        "description": `表情的文件位置，文件列表${JSON.stringify(fs.readdirSync("./emotion"))}`,
                    }
                },
                "required": ["emotion"]
            },
        }
    },
    {
        "type": "function",
        "function": {
            "name": "cmdRequest",
            "description": "在一台windows电脑上执行cmd指令，\n因为需要人工审核，所以该函数只会返回请求id，\n执行返回的结果还要等一条含相同id的信息，在没有等到前不要发送任何有关这个命令的消息",
            "parameters": {
                "type": "object",
                "properties": {
                    "cmd": {
                        "type": "string",
                        "description": `cmd指令，通过换行符\\n隔开，返回的只是请求id，不是结果！不是结果！不是结果！`,
                    }
                },
                "required": ["cmd"]
            },
        }
    },
    {
        "type": "function",
        "function": {
            "name": "writeFile",
            "description": "在一台windows电脑上写入文件",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": `路径，支持相对路径和绝对路径`,
                    },
                    "data": {
                        "type": "string",
                        "description": `写入的数据`,
                    }
                },
                "required": ["path","data"]
            },
        }
    }
]
toolFunction = {
    "工具函数名": (参数) => {
        return "内容"
    },
    "https": (val) => {
        try {
            var data = execSync(`node ./lib/https.js "${val.url}"`, { encoding: 'utf8' });
            //exec是为了同步阻塞
            return data;
        } catch (e) {
            logger.info(e)
            return "请求失败"
        }
    },
    "http": (val) => {
        try {
            var data = execSync(`node ./lib/http.js "${val.url}"`, { encoding: 'utf8' });
            return data;
        } catch (e) {
            logger.info(e)
            return "请求失败"
        }
    },
    "time": (val) => {
        return new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    },
    "emotion": (val) => {
        if (fs.readdirSync(`emotion`).indexOf(val.emotion) != -1) {
            logger.debug()
            reply({
                type: 'image',
                data: {
                    url: `file:///${__dirname.replace(/\\/gi,"/")}/emotion/${val.emotion}`
                }
            })
            return "OK"
        }
        else return "没有这个表情";
    },
    "cmdRequest": (val) => {
        var n = space.exec.length;
            reply(`指令已排队，输入".agree ${n}"执行\n${val.cmd}`);
            space.exec.push({
                "type":"cmd",
                "data":val.cmd
            })
        return n.toString();
    },
    "writeFile": (val) => {
        var n = space.exec.length;
            reply(`指令已排队，输入".agree ${n}"执行 ${val.path} <-\n${val.data}`);
            space.exec.push({
                "type":"writeFile",
                "path":val.path,
                "data":val.data
            })
        return n.toString();
    }
}