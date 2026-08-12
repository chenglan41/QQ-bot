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
            "name": "sendImage",
            "description": "发送一张图片",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": `图片链接(http,https,file均可)`,
                    }
                },
                "required": ["url"]
            },
        }
    },
    {
        "type": "function",
        "function": {
            "name": "sendVideo",
            "description": "发送一个视频",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": `视频链接(http,https,file均可)`,
                    }
                },
                "required": ["url"]
            },
        }
    },
    {
        "type": "function",
        "function": {
            "name": "seeing_image",
            "description": "识别图片，返回语言文字描述，但是你可以通过prompt让其返回json(因为需要模型读取，所以该函数不会返回任何值，执行返回的结果还要等一条含相同url的信息，在没有等到前不要发送任何有关这个命令的消息,不需要短时间重复调用,不需要额外搜索求证)",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "图片路径，无法访问本地路径"
                    },
                    "prompt": {
                        "type": "string",
                        "description": "识别内容的提示，例如：“识别图中的动物”“识别图中的按键并定位中心坐标”"
                    }
                },
                "required": ["url", "prompt"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "seeing_video",
            "description": "识别视频，返回语言文字描述，但是你可以通过prompt让其返回json(因为需要模型读取，所以该函数不会返回任何值，执行返回的结果还要等一条含相同url的信息，在没有等到前不要发送任何有关这个命令的消息,且不要短时间重复调用)",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "视频路径，无法访问本地路径"
                    },
                    "prompt": {
                        "type": "string",
                        "description": "识别内容的提示，例如：“识别视频的动物”“识别视频的角色”"
                    }
                },
                "required": ["url", "prompt"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "readFile",
            "description": "读取文件的一段，返回string(用户无法看到该部分内容，需要你告诉他)(若从文件末尾读取则将start设为负数，比如读取某文件倒数第100字后的内容，start:-100,len:10000)",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "路径，以./开头"
                    },
                    "start": {
                        "type": "number",
                        "description": "起始位置"
                    },
                    "len": {
                        "type": "number",
                        "description": "截取长度,不超过10000"
                    }
                },
                "required": ["url", "start", "len"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "readDir",
            "description": "读取目录(用户无法看到该部分内容，需要你告诉他)",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "路径，以./开头"
                    }
                },
                "required": ["url"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "writeFile",
            "description": "写入文件，不存在的文件会被创建",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "路径，以./开头"
                    },
                    "data": {
                        "type": "string",
                        "description": "写入内容"
                    }
                },
                "required": ["url", "data"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "download",
            "description": "下载文件到本地",
            "parameters": {
                "type": "object",
                "properties": {
                    "link": {
                        "type": "string",
                        "description": "下载链接"
                    },
                    "url": {
                        "type": "string",
                        "description": "保存路径"
                    }
                },
                "required": ["url", "link"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "visiting",
            "description": "联网访问，返回网页内容",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "url"
                    }
                },
                "required": ["url"]
            }
        }
    }
]
toolFunction = {
    "工具函数名": (参数) => {
        if (参数 == undefined) return "status"
        return "内容"
    },
    "time": (val) => {
        if (val == undefined) return;
        return new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });
    },
    "emotion": (val) => {
        // logger.debug(val)
        if (val == undefined) return "skip";
        if (fs.readdirSync(`emotion`).indexOf(val.emotion) != -1) {
            reply({
                type: 'image',
                data: {
                    url: `file:///${__dirname.replace(/\\/gi, "/")}/emotion/${val.emotion}`
                }
            })
            return "OK"
        }
        else return "没有这个表情";
    },
    "sendImage": (val) => {
        // logger.debug(val)
        try {
            if (val.url.indexOf("https") == -1) execSync(`node ./lib/http.js "${val.url}"`, { encoding: 'utf8' });
            else execSync(`node ./lib/https.js "${val.url}"`, { encoding: 'utf8' });
            reply({
                type: 'image',
                data: {
                    url: val.url
                }
            })
            return "OK";
        } catch (e) {
            return e.toString();
        }
    },
    "sendVideo": (val) => {
        // logger.debug(val)
        try {
            if (val.url.indexOf("https") == -1) execSync(`node ./lib/http.js "${val.url}"`, { encoding: 'utf8' });
            else execSync(`node ./lib/https.js "${val.url}"`, { encoding: 'utf8' });
            reply({
                type: 'video',
                data: {
                    url: val.url
                }
            })
            return "OK";
        } catch (e) {
            return e.toString();
        }
    },
    "seeing_image": async (val) => {
        if(val == undefined)return;
        logger.debug(val)
        var openai = new OpenAI(model[boxConfig.seeing_model][0]);
        var ask = await openai.chat.completions.create({
            messages: [
                {
                    "role": "user",
                    "content": [
                        { "type": "image_url", "image_url": { "url": val.url } },
                        { "type": "text", "text": val.prompt }
                    ]
                }
            ],
            stream: false,
            user_id: "1",
            ...model[boxConfig.seeing_model][1]
        });
        ask.choices[0].message.content = val.url + " " + ask.choices[0].message.content;
        ask.choices[0].message.role = "user";
        fs.writeFileSync(
            `./data/${back.type + back.id}/reply-x.json`,
            (fs.statSync(`./data/${back.type + back.id}/reply-x.json`).size == 0 ? "" : ",\n") +
            JSON.stringify(ask.choices[0].message),
            { flag: "a+" }
        )
        return "";
    },
    "seeing_video": async (val) => {
        if(val == undefined)return;
        var openai = new OpenAI(model[boxConfig.seeing_model][0]);
        var ask = await openai.chat.completions.create({
            messages: [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "video_url",
                            "video_url": {
                                "url": val.url
                            }
                        },
                        { "type": "text", "text": val.prompt }
                    ]
                }
            ],
            stream: false,
            user_id: "1",
            ...model[boxConfig.seeing_model][1]
        });
        ask.choices[0].message.content = val.url + " " + ask.choices[0].message.content;
        fs.writeFileSync(
            `./data/${back.type + back.id}/reply-x.json`,
            (fs.statSync(`./data/${back.type + back.id}/reply-x.json`).size == 0 ? "" : ",\n") +
            JSON.stringify(ask.choices[0].message),
            { flag: "a+" }
        )
        return "";
    },
    "readFile": (val) => {
        if(val == undefined)return;
        if (val.len > 10000) return "截取范围过大，请分批截取";
        if (val.url.match(/\.\./gi) != null) return "";
        if(val.start >= 0)return fs.readFileSync(path.normalize(`./data/${back.type+back.id}/${val.url}`)).toString().substr(val.start, val.len);
        else return fs.readFileSync(path.normalize(`./data/${back.type+back.id}/${val.url}`)).toString().substr(fs.statSync(path.normalize(`./data/${back.type+back.id}/${val.url}`)).size+val.start, val.len);
    },
    "readDir": (val) => {
        if(val == undefined)return;
        if (val.url.match(/\.\./gi) != null) return "";
        return JSON.stringify(fs.readdirSync(path.normalize(`./data/${back.type+back.id}/${val.url}`)));
    },
    "writeFile": (val) => {
        if(val == undefined)return;
        if (val.url.match(/\.\./gi) != null) return "已在根目录，无法再向上";
        if (getPathSizeSync(`./data/${back.type+back.id}/`) + val.data.length > config.space) return "内存不足"
        fs.writeFileSync(path.normalize(`./data/${back.type+back.id}/${val.url}`), val.data)
        return "ok";
    },
    "download": (val) => {
        if(val == undefined)return;
        if (val.url.match(/\.\./gi) != null) return "fail";
        // fs.writeFileSync(path.normalize(`./data/${back.type+back.id}/${val.url}`),val.data)
        var s = getPathSizeSync(`./data/${back.type+back.id}/`);
        if (val.link.match(/https/gi) != null) {
            fs.writeFileSync(path.normalize(`./data/${back.type+back.id}/${val.url}`), "")
            https.get(val.link, (res) => {
                res.on("data", (chunk) => {
                    if (s + chunk.length > config.space) return "内存不足"
                    s += chunk.length
                    fs.writeFileSync(path.normalize(`./data/${back.type+back.id}/${val.url}`), chunk, { flag: "a+" })
                })
            })
        }
        else if (val.link.match(/http/gi) != null) {
            fs.writeFileSync(path.normalize(`./data/${back.type+back.id}/${val.url}`), "")
            http.get(val.link, (res) => {
                res.on("data", (chunk) => {
                    if (s + chunk.length > config.space) return "内存不足"
                    s += chunk.length
                    fs.writeFileSync(path.normalize(`./data/${back.type+back.id}/${val.url}`), chunk, { flag: "a+" })
                })
            })
        }
        else return "未知的链接"
        return "下载中";
    },
    "visiting": (val) => {
        if(val == undefined)return;
        try {
            var data;
            if (val.url.match(/https/gi) != null) {
                data = execSync(`node ./lib/https.js "${val.url}"`, { encoding: 'utf8' });
            }
            else if (val.url.match(/http/gi) != null) {
                data = execSync(`node ./lib/http.js "${val.url}"`, { encoding: 'utf8' });
            }
            return data;
        } catch (e) {
            logger.error(e)
            return "请求失败"
        }
    }
}