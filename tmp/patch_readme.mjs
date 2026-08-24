// 给 README.md 打补丁：插入多轮询问说明（处理 CRLF 换行）
import fs from 'fs';

let readme = fs.readFileSync('./README.md', 'utf8');
const ins = fs.readFileSync('./tmp/readme_insert.txt', 'utf8');
const hasCRLF = readme.includes('\r\n');
console.log('CRLF detected:', hasCRLF);
const NL = hasCRLF ? '\r\n' : '\n';

// 插入1: 特点部分
if (readme.includes('+ 支持多个Tool Call调用链') && !readme.includes('Agent多轮循环')) {
    readme = readme.replace(
        '+ 支持多个Tool Call调用链' + NL,
        '+ 支持多个Tool Call调用链' + NL + '+ **工具调用自动触发下一轮询问**(Agent多轮循环，详见 AGENT.md)' + NL
    );
    console.log('[1] features patched');
} else {
    console.log('[1] skip (already or missing anchor)');
}

// 插入2: tool calls 工具列表
if (readme.includes('+ AI上网用的 visiting') && !readme.includes('AI Agent 沙盒工具')) {
    readme = readme.replace(
        '+ AI上网用的 visiting' + NL,
        '+ AI上网用的 visiting' + NL + '+ **AI Agent 沙盒工具**(虚拟终端+沙盒文件系统,共14个,详见 AGENT.md)' + NL
    );
    console.log('[2] tool list patched');
} else {
    console.log('[2] skip (already or missing anchor)');
}

// 插入3: 多轮询问小节（放在 ### 提示词 前）
if (readme.includes('### 提示词') && !readme.includes('### 多轮询问(Agent循环)')) {
    readme = readme.replace('### 提示词' + NL, ins + NL + '### 提示词' + NL);
    console.log('[3] loop section patched');
} else {
    console.log('[3] skip (already or missing anchor)');
}

fs.writeFileSync('./README.md', readme, 'utf8');
console.log('README size now:', Buffer.byteLength(readme, 'utf8'));
