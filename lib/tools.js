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
    // {
    //     "type": "function",
    //     "function": {
    //         "name": "seeing_image",
    //         "description": "识别图片，返回语言文字描述，但是你可以通过prompt让其返回json\n(因为需要模型读取，所以该函数不会返回任何值。\n执行返回的结果还要等一条含相同url的信息。\n在没有等到前不要发送任何有关这个命令的消息,不需要短时间重复调用,不需要额外搜索求证\n可以向用户解释你眼神不好正在看)",
    //         "parameters": {
    //             "type": "object",
    //             "properties": {
    //                 "url": {
    //                     "type": "string",
    //                     "description": "图片路径，无法访问本地路径"
    //                 },
    //                 "prompt": {
    //                     "type": "string",
    //                     "description": "识别内容的提示，例如：“识别图中的动物”“识别图中的按键并定位中心坐标”"
    //                 }
    //             },
    //             "required": ["url", "prompt"]
    //         }
    //     }
    // },
    // {
    //     "type": "function",
    //     "function": {
    //         "name": "seeing_video",
    //         "description": "识别视频，返回语言文字描述，但是你可以通过prompt让其返回json\n(因为需要模型读取，所以该函数不会返回任何值。\n执行返回的结果还要等一条含相同url的信息。\n在没有等到前不要发送任何有关这个命令的消息,不需要短时间重复调用,不需要额外搜索求证\n可以向用户解释你眼神不好正在看)",
    //         "parameters": {
    //             "type": "object",
    //             "properties": {
    //                 "url": {
    //                     "type": "string",
    //                     "description": "视频路径，无法访问本地路径"
    //                 },
    //                 "prompt": {
    //                     "type": "string",
    //                     "description": "识别内容的提示，例如：“识别视频的动物”“识别视频的角色”"
    //                 }
    //             },
    //             "required": ["url", "prompt"]
    //         }
    //     }
    // },
    {
        "type": "function",
        "function": {
            "name": "readFile",
            "description": "读取文件的一段，返回string(用户无法看到该部分内容，需要你告诉他)",
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
    },
    // ============================================================
    // AI Agent 沙盒工具（node-pty 虚拟终端 + 沙盒文件系统）
    // uid 参数可选，默认使用当前会话ID（back.type+back.id）
    // ============================================================
    {
        "type": "function",
        "function": {
            "name": "agentHelp",
            "description": "获取 AI Agent 沙盒工具的完整使用说明（终端+文件系统+沙盒限制），遇到 Agent 工具相关问题可先调用它",
            "parameters": {
                "type": "object",
                "properties": {},
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "createProcess",
            "description": "创建虚拟终端(cmd.exe)。工作目录固定为 当前会话沙盒/workspace，返回{id,pid,uid,workdir}。终端内执行命令必须经过沙盒检查，禁止关机/格式化/注册表/账户/杀进程/网络下载/PowerShell/路径穿越/盘符绝对路径等危险命令",
            "parameters": {
                "type": "object",
                "properties": {
                    "uid": {"type": "string", "description": "沙盒归属标识，默认当前会话ID，一般无需传"},
                    "cols": {"type": "integer", "description": "终端列数，默认120"},
                    "rows": {"type": "integer", "description": "终端行数，默认30"}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "removeProcess",
            "description": "关闭虚拟终端，参数为终端id，返回\"ok\"或错误信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer", "description": "要关闭的终端id"}
                },
                "required": ["id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "inputProcess",
            "description": "向虚拟终端输入指令(会自动加回车执行)。返回\"ok\"或错误信息。若命令命中沙盒黑名单会被拒绝执行",
            "parameters": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer", "description": "终端id"},
                    "command": {"type": "string", "description": "要执行的命令，如\"dir\""}
                },
                "required": ["id", "command"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "outputProcess",
            "description": "读取虚拟终端的缓冲区内容（读取后会清空，便于增量获取）。返回缓冲区信息或错误信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "id": {"type": "integer", "description": "终端id"}
                },
                "required": ["id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "createFile",
            "description": "创建文件（已存在则覆盖，父目录不存在会自动创建），返回\"ok\"或错误信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "沙盒内相对路径，如\"a/b.txt\""},
                    "content": {"type": "string", "description": "文件内容（可选，默认空）"}
                },
                "required": ["path"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "createFolder",
            "description": "创建文件夹（已存在返回ok），返回\"ok\"或错误信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "沙盒内相对路径，如\"a/b\""}
                },
                "required": ["path"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "deleteFile",
            "description": "删除文件，返回\"ok\"或错误信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "沙盒内相对路径"}
                },
                "required": ["path"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "deleteFolder",
            "description": "删除文件夹（递归删除其中所有内容，仅限沙盒内，不允许删除沙盒根目录），返回\"ok\"或错误信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "沙盒内相对路径"}
                },
                "required": ["path"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "getFileInfo",
            "description": "读取文件状态数据（大小、创建/修改时间等），返回JSON字符串",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "沙盒内相对路径"}
                },
                "required": ["path"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "getFolderInfo",
            "description": "读取文件夹状态数据（总大小、文件数、创建/修改时间等），返回JSON字符串",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "沙盒内相对路径，默认根目录可用\"\""}
                },
                "required": ["path"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "listDir",
            "description": "读取文件夹内的文件/文件夹列表，返回JSON字符串",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "沙盒内相对路径，默认根目录用\".\""}
                },
                "required": []
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "readFileContent",
            "description": "读取文件内容（文件过大时会截断并提示），返回文件内容字符串",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "沙盒内相对路径"}
                },
                "required": ["path"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "writeFileContent",
            "description": "写入文件（覆盖式，父目录不存在会自动创建），返回\"ok\"或错误信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "沙盒内相对路径"},
                    "content": {"type": "string", "description": "写入内容"}
                },
                "required": ["path", "content"]
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
    // "seeing_image": async (val) => {
    //     if(val == undefined)return "";
    //     logger.debug(val)
    //     var openai = new OpenAI(model[boxConfig.seeing_model][0]);
    //     var ask = await openai.chat.completions.create({
    //         messages: [
    //             {
    //                 "role": "user",
    //                 "content": [
    //                     { "type": "image_url", "image_url": { "url": val.url } },
    //                     { "type": "text", "text": val.prompt }
    //                 ]
    //             }
    //         ],
    //         stream: false,
    //         user_id: "1",
    //         ...model[boxConfig.seeing_model][1]
    //     });
    //     ask.choices[0].message.content = val.url + " " + ask.choices[0].message.content;
    //     ask.choices[0].message.role = "user";
    //     fs.writeFileSync(
    //         `./data/${back.type + back.id}/reply-x.json`,
    //         (fs.statSync(`./data/${back.type + back.id}/reply-x.json`).size == 0 ? "" : ",\n") +
    //         JSON.stringify(ask.choices[0].message),
    //         { flag: "a+" }
    //     )
    //     return "";
    // },
    // "seeing_video": async (val) => {
    //     if(val == undefined)return "";
    //     var openai = new OpenAI(model[boxConfig.seeing_model][0]);
    //     var ask = await openai.chat.completions.create({
    //         messages: [
    //             {
    //                 "role": "user",
    //                 "content": [
    //                     {
    //                         "type": "video_url",
    //                         "video_url": {
    //                             "url": val.url
    //                         }
    //                     },
    //                     { "type": "text", "text": val.prompt }
    //                 ]
    //             }
    //         ],
    //         stream: false,
    //         user_id: "1",
    //         ...model[boxConfig.seeing_model][1]
    //     });
    //     ask.choices[0].message.content = val.url + " " + ask.choices[0].message.content;
    //     fs.writeFileSync(
    //         `./data/${back.type + back.id}/reply-x.json`,
    //         (fs.statSync(`./data/${back.type + back.id}/reply-x.json`).size == 0 ? "" : ",\n") +
    //         JSON.stringify(ask.choices[0].message),
    //         { flag: "a+" }
    //     )
    //     return "";
    // },
    "readFile": (val) => {
        if(val == undefined)return "";
        // if (val.len > 10000) return "截取范围过大，请分批截取";
        if (val.url.match(/\.\./gi) != null) return "";
        return fs.readFileSync(path.normalize(`./data/${back.type+back.id}/${val.url}`)).toString()
        // if(val.start >= 0)return fs.readFileSync(path.normalize(`./data/${back.type+back.id}/${val.url}`)).toString().substr(val.start, val.len);
        // else return fs.readFileSync(path.normalize(`./data/${back.type+back.id}/${val.url}`)).toString().substr(fs.statSync(path.normalize(`./data/${back.type+back.id}/${val.url}`)).size+val.start, val.len);
    },
    "readDir": (val) => {
        if(val == undefined)return "";
        if (val.url.match(/\.\./gi) != null) return "";
        return JSON.stringify(fs.readdirSync(path.normalize(`./data/${back.type+back.id}/${val.url}`)));
    },
    "writeFile": (val) => {
        if(val == undefined)return "";
        if (val.url.match(/\.\./gi) != null) return "已在根目录，无法再向上";
        if (getPathSizeSync(`./data/${back.type+back.id}/`) + val.data.length > config.space) return "内存不足"
        fs.writeFileSync(path.normalize(`./data/${back.type+back.id}/${val.url}`), val.data)
        return "ok";
    },
    "download": (val) => {
        if(val == undefined)return "";
        if (val.url.match(/\.\./gi) != null) return "fail";
        // fs.writeFileSync(path.normalize(`./data/${back.type+back.id}/${val.url}`),val.data)
        var s = getPathSizeSync(`./data/${back.type+back.id}/`);
        if (val.link.match(/https/gi) != null) {
            //临时修复下载文件炸开Bug的方案
            fs.writeFileSync(path.normalize(`./data/${back.type+back.id}/${val.url}`), "",{flag:"a+"})
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
            fs.writeFileSync(path.normalize(`./data/${back.type+back.id}/${val.url}`), "", { flag: "a+" })
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
        if(val == undefined)return "";
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
    },
    // ============================================================
    // AI Agent 沙盒工具实现
    // uid 默认取当前会话 back.type+back.id
    // ============================================================
    "agentHelp": (val) => {
        return Agent.help();
    },
    "createProcess": (val) => {
        if (val == undefined) return "错误: 缺少参数";
        const uid = val.uid || (back.type + back.id);
        return Agent.createProcess({ uid: uid, cols: val.cols, rows: val.rows });
    },
    "removeProcess": (val) => {
        if (val == undefined || val.id === undefined) return "错误: 缺少终端id";
        return Agent.removeProcess({ id: val.id });
    },
    "inputProcess": (val) => {
        if (val == undefined || val.id === undefined || val.command === undefined) return "错误: 缺少终端id或command";
        return Agent.inputProcess({ id: val.id, command: val.command });
    },
    "outputProcess": (val) => {
        if (val == undefined || val.id === undefined) return "错误: 缺少终端id";
        return Agent.outputProcess({ id: val.id });
    },
    "createFile": (val) => {
        if (val == undefined) return "错误: 缺少参数";
        const uid = val.uid || (back.type + back.id);
        return Agent.createFile(uid, val);
    },
    "createFolder": (val) => {
        if (val == undefined) return "错误: 缺少参数";
        const uid = val.uid || (back.type + back.id);
        return Agent.createFolder(uid, val);
    },
    "deleteFile": (val) => {
        if (val == undefined) return "错误: 缺少参数";
        const uid = val.uid || (back.type + back.id);
        return Agent.deleteFile(uid, val);
    },
    "deleteFolder": (val) => {
        if (val == undefined) return "错误: 缺少参数";
        const uid = val.uid || (back.type + back.id);
        return Agent.deleteFolder(uid, val);
    },
    "getFileInfo": (val) => {
        if (val == undefined) return "错误: 缺少参数";
        const uid = val.uid || (back.type + back.id);
        return Agent.getFileInfo(uid, val);
    },
    "getFolderInfo": (val) => {
        if (val == undefined) return "错误: 缺少参数";
        const uid = val.uid || (back.type + back.id);
        return Agent.getFolderInfo(uid, val);
    },
    "listDir": (val) => {
        if (val == undefined) return "错误: 缺少参数";
        const uid = val.uid || (back.type + back.id);
        return Agent.listDir(uid, val);
    },
    "readFileContent": (val) => {
        if (val == undefined) return "错误: 缺少参数";
        const uid = val.uid || (back.type + back.id);
        return Agent.readFileContent(uid, val);
    },
    "writeFileContent": (val) => {
        if (val == undefined) return "错误: 缺少参数";
        const uid = val.uid || (back.type + back.id);
        return Agent.writeFileContent(uid, val);
    }
}