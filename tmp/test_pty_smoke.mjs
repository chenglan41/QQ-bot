// node-pty 冒烟测试：验证 AttachConsole failed 报错是否影响终端功能
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pty = require('node-pty');

const p = pty.spawn('cmd.exe', [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.cwd(),
    useConpty: true
});

let out = '';
p.onData(d => { out += d; });

p.write('echo HELLO_PTY_SMOKE_TEST\r');

setTimeout(() => {
    const ok = out.includes('HELLO_PTY_SMOKE_TEST');
    console.log('[SMOKE] 收到终端输出, 含测试标记:', ok);
    console.log('[SMOKE] 输出前 200 字符:', JSON.stringify(out.slice(0, 200)));
    p.kill();
    process.exit(ok ? 0 : 1);
}, 2500);
