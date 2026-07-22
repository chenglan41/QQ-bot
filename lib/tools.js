
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
            "name": "emotion",
            "description": "发送表情，返回发送状态，每次回复可先发一个表情,content:''",
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
    }
}