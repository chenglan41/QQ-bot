
import http from "http";
http.get(process.argv[2], (res) => {
    // 状态码异常抛出错误
    if (res.statusCode != 200) {
        console.log(`请求失败，状态码：${res.statusCode}`);
    }
    let data = '';
    // 分段接收数据
    res.on('data', chunk => {
        data += chunk.toString();
    });
    // 接收完成返回文本
    res.on('end', () => {
        console.log(data.substr(0, 199999))
    });
    // 流错误捕获
    res.on('error', err => console.log(err.toString()));

}).on('error', err => console.log(err.toString())); // 请求底层错误