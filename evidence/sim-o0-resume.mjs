// sim-o0-resume.mjs — o0 下载停滞续传行为验证(零网络, 确定性):
//   node evidence/sim-o0-resume.mjs → exit 0 全过 / 1 失败
// 方法: 取主脚本真实 o0 源码段(未改写一字, new Function 语义经 eval 取函数),
//   window.fetch 换成受控桩(干净流/半道僵死流/忽略Range回206外全量流),
//   o0.stallMs/o0.bk 调小只加速计时(真实等待逻辑不变)。
// 断言: T1 干净下载字节一致且首轮无Range; T2 僵死后自动Range续传字节完整;
//   T3 服务端无206回退全量重下; T4 致命403直抛不空转5轮; T5 全灭5轮后抛错。
import fs from 'node:fs';

const fail = [];
const ok = (name, cond, extra = '') => {
  console.log((cond ? '✓ ' : '✗ ') + name + (extra ? ' | ' + extra : ''));
  if (!cond) fail.push(name);
};

const src = fs.readFileSync('bilibili-helper-content-script.js', 'utf8');
const i = src.indexOf('o0=async');
const j = src.indexOf('}},R=async(', i);
const seg = src.slice(i, j + 2); // 含闭合的 }}，得完整 o0=async...=>{...}
ok('S0 取到真实o0源码段(续传三件套齐)', seg.includes('Range:"bytes="+t+"-"') && seg.includes('下载停滞超过') && seg.includes('new Blob(K)'));
const o0 = eval('(' + seg.replace(/^o0=/, '') + ')');
o0.stallMs = 300; o0.bk = 20; // 只加速计时，不改逻辑

const enc = new TextEncoder();
const chunk = (s) => enc.encode(s);
// stallAfter>=0: 产出 stallAfter+1 块后 read() 永不 resolve(模拟 TCP 半死)
const mkBody = (chunks, stallAfter = -1) => ({ getReader: () => mkReader(chunks, stallAfter) });
const mkReader = (chunks, stallAfter = -1) => {
  let k = 0, dead = false;
  return {
    read() {
      if (dead) return new Promise(() => {});
      if (stallAfter >= 0 && k > stallAfter) return new Promise(() => {});
      if (k >= chunks.length) return Promise.resolve({ done: true, value: undefined });
      return Promise.resolve({ done: false, value: chunks[k++] });
    },
    cancel() { dead = true; return Promise.resolve(); },
  };
};
const H = (map) => ({ get: (h) => (h in map ? map[h] : null) });

// ---- T1 干净下载 ----
{
  const calls = [];
  globalThis.window = { fetch: async (url, opt) => {
    const keys = opt && opt.headers ? Object.keys(opt.headers) : [];
    calls.push(keys.length ? JSON.stringify(opt.headers) : '(full)');
    return { ok: true, status: 200, headers: H({ 'content-length': '4' }), body: mkBody([chunk('ab'), chunk('cd')]) };
  } };
  const blob = await o0('http://x/v.m4s', 4, () => {});
  ok('T1 干净下载字节一致', (await blob.text()) === 'abcd');
  ok('T1 首轮无Range头(与旧行为一致)', calls.length === 1 && !calls[0].includes('Range'), calls.join('|'));
  delete globalThis.window;
}

// ---- T2 半道僵死→Range续传 ----
{
  const calls = [];
  let n = 0;
  globalThis.window = { fetch: async (url, opt) => {
    n++;
    const rg = opt && opt.headers && opt.headers.Range;
    calls.push(rg || '(full)');
    if (n === 1) return { ok: true, status: 200, headers: H({ 'content-length': '4' }), body: mkBody([chunk('ab')], 0) };
    if (rg === 'bytes=2-') return { ok: true, status: 206, headers: H({ 'content-range': 'bytes 2-3/4', 'content-length': '2' }), body: mkBody([chunk('cd')]) };
    throw new Error('unexpected fetch n=' + n + ' rg=' + rg);
  } };
  const prog = [];
  const blob = await o0('http://x/v.m4s', 4, (t, tot) => prog.push(t + '/' + tot));
  ok('T2 僵死后Range续传字节完整', (await blob.text()) === 'abcd');
  ok('T2 第二轮带Range: bytes=2-', calls[1] === 'bytes=2-', calls.join(' | '));
  ok('T2 续传等待中刷过进度', prog.length > 0, prog.slice(0, 4).join(','));
  delete globalThis.window;
}

// ---- T3 服务端忽略Range(回200全量)→回退全量重下 ----
{
  let n = 0;
  globalThis.window = { fetch: async (url, opt) => {
    n++;
    const rg = opt && opt.headers && opt.headers.Range;
    if (n === 1) return { ok: true, status: 200, headers: H({ 'content-length': '2' }), body: mkBody([chunk('a')], 0) };
    return { ok: true, status: 200, headers: H({ 'content-length': '2' }), body: mkBody([chunk('a'), chunk('b')]) }; // 无论是否带Range都回全量
  } };
  const blob = await o0('http://x/v.m4s', 2, () => {});
  ok('T3 无206回退全量重下字节正确', (await blob.text()) === 'ab' && n === 3, 'fetch=' + n);
  delete globalThis.window;
}

// ---- T4 致命403直抛(不空转5轮) ----
{
  let n = 0;
  globalThis.window = { fetch: async () => { n++; return { ok: false, status: 403 }; } };
  let err = null;
  try { await o0('http://x/v.m4s', 10, () => {}); } catch (e) { err = e; }
  ok('T4 403直抛仅1次请求', !!err && /403/.test(err.message) && n === 1, 'fetch=' + n);
  delete globalThis.window;
}

// ---- T5 全灭(持续僵死)→5轮耗尽抛错 ----
{
  globalThis.window = { fetch: async () => ({ ok: true, status: 200, headers: H({ 'content-length': '8' }), body: mkBody([chunk('a')], 0) }) };
  const t0 = Date.now();
  let err = null;
  try { await o0('http://x/v.m4s', 8, () => {}); } catch (e) { err = e; }
  ok('T5 5轮耗尽抛停滞错(非永冻)', !!err && /下载停滞超过/.test(err.message), String((err && err.message) || err).slice(0, 60));
  delete globalThis.window;
}

console.log(fail.length ? `SIM-FAIL n=${fail.length}: ${fail.join(' | ')}` : 'ALL SIM CHECKS PASS');
process.exit(fail.length ? 1 : 0);
