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
ok('S0 取到真实o0源码段(续传三件套齐)', seg.includes('Range:"bytes="+t+"-"') && seg.includes('下载停滞超过') && seg.includes('u.size=u.byteLength') && seg.includes('正在整理已下载的数据，请勿重试'));
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
  const phases = [];
  const blob = await o0('http://x/v.m4s', 4, (t, tot, phase) => { if (phase) phases.push(phase); });
  ok('T1 干净下载字节一致且不再包一层Blob', blob instanceof Uint8Array && blob.size === 4 && new TextDecoder().decode(blob) === 'abcd', `size=${blob && blob.size}`);
  ok('T1 整理时提示不要重试', phases.includes('正在整理已下载的数据，请勿重试'), phases.join('|'));
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
  ok('T2 僵死后Range续传字节完整', blob instanceof Uint8Array && new TextDecoder().decode(blob) === 'abcd');
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
  ok('T3 无206回退全量重下字节正确', blob instanceof Uint8Array && new TextDecoder().decode(blob) === 'ab' && n === 3, 'fetch=' + n);
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

{
  o0.forceNoHold = true;
  globalThis.window = { fetch: async () => ({ ok: true, status: 200, headers: H({ 'content-length': '4' }), body: mkBody([chunk('ab'), chunk('cd')]) }) };
  const packed = await o0('http://x/v.m4s', 4, () => {});
  const text = packed && packed.blob ? new TextDecoder().decode(new Uint8Array(await packed.blob.arrayBuffer())) : '';
  ok('T6 拼不成一整块时直接交出已下载的小块', packed && packed.noHold === true && packed.size === 4 && text === 'abcd', `size=${packed && packed.size} ${text}`);
  o0.forceNoHold = false;
  delete globalThis.window;
}
{
  o0.forceParts = true;
  globalThis.window = { fetch: async () => ({ ok: true, status: 200, headers: H({ 'content-length': '4' }), body: mkBody([chunk('ab'), chunk('cd')]) }) };
  const packed = await o0('http://x/v.m4s', 4, () => {});
  const text = packed && packed.parts ? new TextDecoder().decode(new Uint8Array([...packed.parts[0], ...packed.parts[1]])) : '';
  ok('T7 连小块文件也包不成时仍交出每一小块', packed && packed.noHold === true && !packed.blob && packed.parts && packed.parts.length === 2 && text === 'abcd', `n=${packed && packed.parts && packed.parts.length} ${text}`);
  o0.forceParts = false;
  delete globalThis.window;
}
{
  const got = [];
  let closed = 0;
  globalThis.q = { dir: { getFileHandle() {} }, jsMergeMax: 3, spillTo: async () => ({ write: async (c) => { got.push(c.byteLength); }, close: async () => { closed++; } }) };
  globalThis.window = { fetch: async () => ({ ok: true, status: 200, headers: H({ 'content-length': '4' }), body: mkBody([chunk('ab'), chunk('cd')]) }) };
  const packed = await o0('http://x/v.m4s', 4, () => {});
  ok('T8 单份超过上限就边下边写入且不留整块', packed && packed.streamed === true && packed.size === 4 && got.join(',') === '2,2' && closed === 1, `size=${packed && packed.size} writes=${got.join(',')} closed=${closed}`);
  delete globalThis.q;
  delete globalThis.window;
}
{
  let fetches = 0, readers = 0;
  globalThis.q = { dirAsked: true, jsMergeMax: 3 };
  globalThis.window = { fetch: async () => { fetches++; return { ok: true, status: 200, headers: H({ 'content-length': '10' }), body: { cancel() {}, getReader() { readers++; return mkReader([chunk('abcd')]); } } }; } };
  let err = null;
  try { await o0('http://x/v.m4s', 10, () => {}); } catch (e) { err = e; }
  ok('T9 已知超限且没文件夹时不读正文并要求重选', fetches === 1 && readers === 0 && err && err.needDir === true && /请先选择文件夹再重试/.test(err.message) && globalThis.q.dirAsked === false, `fetches=${fetches} readers=${readers} ${err && err.message}`);
  delete globalThis.q;
  delete globalThis.window;
}
{
  let pulls = 0;
  globalThis.q = { dirAsked: true, jsMergeMax: 3 };
  globalThis.window = { fetch: async () => ({ ok: true, status: 200, headers: H({}), body: { getReader() { const r = mkReader([chunk('ab'), chunk('cd'), chunk('ef')]); const read = r.read.bind(r); r.read = () => { pulls++; return read(); }; return r; } } }) };
  let err = null;
  try { await o0('http://x/v.m4s', 0, () => {}); } catch (e) { err = e; }
  ok('T10 体积未知但越积越大时停住并要求重选', pulls === 2 && err && err.needDir === true && globalThis.q.dirAsked === false, `pulls=${pulls} ${err && err.message}`);
  delete globalThis.q;
  delete globalThis.window;
}
{
  const prev = globalThis.performance;
  globalThis.performance = { memory: { usedJSHeapSize: 80, jsHeapSizeLimit: 100 } };
  globalThis.window = { fetch: async () => ({ ok: true, status: 200, headers: H({ 'content-length': '4' }), body: mkBody([chunk('ab'), chunk('cd')]) }) };
  const packed = await o0('http://x/v.m4s', 4, () => {});
  const text = new TextDecoder().decode(new Uint8Array(await packed.blob.arrayBuffer()));
  ok('T11 页面已较满时不拼整块改交Blob', packed && packed.noHold === true && !(packed instanceof Uint8Array) && text === 'abcd', `text=${text}`);
  globalThis.performance = prev;
  delete globalThis.window;
}
{
  const writes = [];
  const seeks = [];
  let n = 0;
  globalThis.q = {
    dir: { getFileHandle() {} },
    partialName: 'v.mp4',
    spillTo: async () => ({ write: async (c) => { writes.push(new TextDecoder().decode(c)); }, seek: async (at) => { seeks.push(at); }, close: async () => {} }),
  };
  globalThis.window = { fetch: async (_u, opt) => {
    n++;
    const range = opt && opt.headers && opt.headers.Range;
    if (!range) return { ok: true, status: 200, headers: H({ 'content-length': '4' }), body: mkBody([chunk('ab')], 0) };
    if (n < 6) return { ok: true, status: 206, headers: H({ 'content-range': 'bytes 2-3/4', 'content-length': '2' }), body: mkBody([], 0) };
    return { ok: true, status: 206, headers: H({ 'content-range': 'bytes 2-3/4', 'content-length': '2' }), body: mkBody([chunk('cd')]) };
  } };
  let err = null;
  try { await o0('http://x/v.m4s', 4, () => {}); } catch (e) { err = e; }
  const again = await o0('http://x/v.m4s', 4, () => {});
  ok('T12 失败后留下已收部分且重试接着下', err && /点重试会接着下/.test(err.message) && globalThis.q.partial == null && again && again.streamed === true && again.size === 4 && writes.join('') === 'abcd' && seeks[0] === 2, `writes=${writes.join('')} seeks=${seeks.join(',')} size=${again && again.size} ${err && err.message}`);
  delete globalThis.q;
  delete globalThis.window;
}
{
  const store = { bilibili_helper_partial: JSON.stringify({ name: 'v.mp4', bytes: 2 }) };
  const writes = [];
  const seeks = [];
  let range = '';
  globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } };
  globalThis.q = { dir: { getFileHandle() {} }, partialName: 'v.mp4', spillTo: async () => ({ write: async (c) => { writes.push(new TextDecoder().decode(c)); }, seek: async (at) => { seeks.push(at); }, close: async () => {} }) };
  globalThis.window = { fetch: async (_u, opt) => { range = opt && opt.headers && opt.headers.Range || ''; return { ok: true, status: 206, headers: H({ 'content-range': 'bytes 2-3/4', 'content-length': '2' }), body: mkBody([chunk('cd')]) }; } };
  const packed = await o0('http://x/v.m4s', 4, () => {});
  ok('T13 关掉页面后重试仍从记下的断点接着下', range === 'bytes=2-' && packed && packed.streamed === true && packed.size === 4 && writes.join('') === 'cd' && seeks[0] === 2 && !store.bilibili_helper_partial, `range=${range} writes=${writes.join('')} ${store.bilibili_helper_partial || ''}`);
  delete globalThis.q;
  delete globalThis.window;
  delete globalThis.localStorage;
}
{
  const store = { bilibili_helper_partial: JSON.stringify({ 'a.mp4': 2, 'b.mp4': 5 }) };
  globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } };
  globalThis.q = { dir: { getFileHandle() {} }, partialName: 'a.mp4', spillTo: async () => ({ write: async () => {}, seek: async () => {}, close: async () => {} }) };
  globalThis.window = { fetch: async (_u, opt) => ({ ok: true, status: 206, headers: H({ 'content-range': 'bytes 2-3/4', 'content-length': '2' }), body: mkBody([chunk('cd')]) }) };
  const packed = await o0('http://x/a.mp4', 4, () => {});
  const left = JSON.parse(store.bilibili_helper_partial || '{}');
  ok('T14 下完一个文件不会清掉另一个文件的断点', packed && packed.streamed === true && left['a.mp4'] == null && left['b.mp4'] === 5, JSON.stringify(left));
  delete globalThis.q;
  delete globalThis.window;
  delete globalThis.localStorage;
}
{
  const store = { bilibili_helper_partial: JSON.stringify({ 'v.mp4': 2 }) };
  let range = 'none';
  globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } };
  globalThis.q = { dir: { getFileHandle: async () => ({ getFile: async () => ({ size: 0 }) }) }, partialName: 'v.mp4', spillTo: async () => ({ write: async () => {}, seek: async () => {}, close: async () => {} }) };
  globalThis.window = { fetch: async (_u, opt) => { range = (opt && opt.headers && opt.headers.Range) || ''; return { ok: true, status: 200, headers: H({ 'content-length': '4' }), body: mkBody([chunk('ab'), chunk('cd')]) }; } };
  const packed2 = await o0('http://x/v.mp4', 4, () => {});
  const text = new TextDecoder().decode(packed2);
  ok('T15 文件夹里没有那么长的文件就从头下并清掉断点', range === '' && text === 'abcd' && packed2.byteLength === 4 && !store.bilibili_helper_partial, `range=${range} text=${text} left=${store.bilibili_helper_partial || ''}`);
  delete globalThis.q;
  delete globalThis.window;
  delete globalThis.localStorage;
}
{
  const store = { bilibili_helper_partial: JSON.stringify({ 'v.mp4': 2 }) };
  const cuts = [];
  const seeks = [];
  const writes = [];
  globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } };
  globalThis.q = { dir: { getFileHandle: async () => ({ getFile: async () => ({ size: 8 }) }) }, partialName: 'v.mp4', spillTo: async () => ({ write: async (c) => { writes.push(new TextDecoder().decode(c)); }, seek: async (at) => { seeks.push(at); }, truncate: async (at) => { cuts.push(at); }, close: async () => {} }) };
  globalThis.window = { fetch: async (_u, opt) => ({ ok: true, status: 206, headers: H({ 'content-range': 'bytes 2-3/4', 'content-length': '2' }), body: mkBody([chunk('cd')]) }) };
  const packed3 = await o0('http://x/v.mp4', 4, () => {});
  ok('T16 文件比断点长时先截掉旧尾巴再接着写', packed3 && packed3.streamed === true && packed3.size === 4 && cuts[0] === 2 && seeks[0] === 2 && writes.join('') === 'cd', `cuts=${cuts.join(',')} seeks=${seeks.join(',')} writes=${writes.join('')}`);
  delete globalThis.q;
  delete globalThis.window;
  delete globalThis.localStorage;
}
{
  const store = { bilibili_helper_partial: JSON.stringify({ 'v.mp4': 2 }) };
  let fetches = 0;
  globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } };
  globalThis.showDirectoryPicker = async () => ({});
  globalThis.q = { partialName: 'v.mp4', dirAsked: true };
  globalThis.window = { fetch: async () => { fetches++; return { ok: true, status: 200, headers: H({ 'content-length': '4' }), body: mkBody([chunk('ab'), chunk('cd')]) }; } };
  let err = null;
  try { await o0('http://x/v.mp4', 4, () => {}); } catch (e) { err = e; }
  const left = JSON.parse(store.bilibili_helper_partial || '{}');
  ok('T17 没有文件夹时不把断点后的半截读进页面', fetches === 0 && err && err.needDir === true && /请先选择文件夹/.test(err.message) && left['v.mp4'] === 2 && globalThis.q.dirAsked === false, `fetches=${fetches} left=${left['v.mp4']} ${err && err.message}`);
  delete globalThis.q;
  delete globalThis.window;
  delete globalThis.localStorage;
  delete globalThis.showDirectoryPicker;
}
{
  const store = { bilibili_helper_partial: JSON.stringify({ 'v.mp4': 2 }) };
  let range = 'none';
  globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } };
  globalThis.q = { partialName: 'v.mp4' };
  globalThis.window = { fetch: async (_u, opt) => { range = (opt && opt.headers && opt.headers.Range) || ''; return { ok: true, status: 200, headers: H({ 'content-length': '4' }), body: mkBody([chunk('ab'), chunk('cd')]) }; } };
  const packed4 = await o0('http://x/v.mp4', 4, () => {});
  const text = new TextDecoder().decode(packed4);
  ok('T18 不能选文件夹时清掉断点并从头下完整文件', range === '' && text === 'abcd' && !store.bilibili_helper_partial, `range=${range} text=${text} left=${store.bilibili_helper_partial || ''}`);
  delete globalThis.q;
  delete globalThis.window;
  delete globalThis.localStorage;
}
{
  const prev = globalThis.performance;
  globalThis.performance = {};
  globalThis.q = { holdMax: 3, dirAsked: true };
  globalThis.window = { fetch: async () => ({ ok: true, status: 200, headers: H({ 'content-length': '4' }), body: mkBody([chunk('ab'), chunk('cd')]) }) };
  let err5 = null;
  try { await o0('http://x/v.m4s', 4, () => {}); } catch (e) { err5 = e; }
  ok('T19 不报告剩余空间且没有文件夹时较大的一份先停住', err5 && err5.needDir === true && /请先选择文件夹/.test(err5.message) && globalThis.q.dirAsked === false, `${err5 && err5.message}`);
  globalThis.performance = prev;
  delete globalThis.q;
  delete globalThis.window;
}
{
  const prev = globalThis.performance;
  const writes = [];
  globalThis.performance = {};
  globalThis.q = { holdMax: 3, dir: { getFileHandle: async () => ({}) }, spillTo: async () => ({ write: async (c) => { writes.push(new TextDecoder().decode(c)); }, close: async () => {} }) };
  globalThis.window = { fetch: async () => ({ ok: true, status: 200, headers: H({ 'content-length': '4' }), body: mkBody([chunk('ab'), chunk('cd')]) }) };
  const packed6 = await o0('http://x/v.m4s', 4, () => {});
  ok('T20 不报告剩余空间且已选文件夹时较大的一份边下边写', packed6 && packed6.streamed === true && writes.join('') === 'abcd', `writes=${writes.join('')}`);
  globalThis.performance = prev;
  delete globalThis.q;
  delete globalThis.window;
}
{
  const a = src.indexOf('R=async');
  const b = src.indexOf('}},qM=', a);
  const body = src.slice(a, b + 2).replace(/^R=/, '');
  let calls = 0;
  let sawSpill = false;
  const q = {};
  const o0stub = async () => {
    calls++;
    if (calls === 1) throw Object.assign(new Error('need'), { needDir: true });
    sawSpill = typeof q.spillTo === 'function';
    return { streamed: true, size: 4 };
  };
  let picks = 0;
  globalThis.showDirectoryPicker = async () => { picks++; q.dir = { getFileHandle() {}, createWritable() {} }; return q.dir; };
  const R = eval('(function(q,o0){return ' + body + '})')(q, o0stub);
  const btn = { classList: { add() {}, remove() {} } };
  const row = { innerHTML: '' };
  await R(btn, { url: 'http://x/v.m4s', size: 4 }, '课', row);
  ok('T21 单个视频太大时先选文件夹再下一次', calls === 2 && picks === 1 && sawSpill === true && row.innerHTML.includes('已边下边写入文件夹'), `calls=${calls} picks=${picks} spill=${sawSpill} ${row.innerHTML}`);
  delete globalThis.showDirectoryPicker;
}
{
  const a = src.indexOf('R=async');
  const b = src.indexOf('}},qM=', a);
  const body = src.slice(a, b + 2).replace(/^R=/, '');
  let calls = 0;
  const q = {};
  const o0stub = async () => {
    calls++;
    if (calls === 1) throw Object.assign(new Error('need'), { needDir: true });
    const err = new Error('permission');
    err.name = 'NotAllowedError';
    throw err;
  };
  let picks = 0;
  globalThis.showDirectoryPicker = async () => { picks++; q.dir = { getFileHandle() {} }; q.dirAsked = true; return q.dir; };
  const R = eval('(function(q,o0){return ' + body + '})')(q, o0stub);
  let err = null;
  try { await R({ classList: { add() {}, remove() {} } }, { url: 'http://x/v.m4s', size: 4 }, '课', { innerHTML: '' }); } catch (e) { err = e; }
  ok('T22 文件夹权限失效时丢掉它，下次才会重新选', calls === 2 && picks === 1 && err && err.name === 'NotAllowedError' && q.dir === null && q.dirAsked === false, `calls=${calls} picks=${picks} dir=${q.dir} asked=${q.dirAsked} ${err && err.name}`);
  delete globalThis.showDirectoryPicker;
}
{
  const store = {};
  let n = 0;
  const denied = () => Object.assign(new Error('write denied'), { name: 'NotAllowedError' });
  globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } };
  globalThis.q = { partialName: 'v.mp4', dir: { getFileHandle: async () => ({}) }, spillTo: async () => ({ write: async () => {}, seek: async () => {}, truncate: async () => {}, close: async () => {} }) };
  globalThis.window = { fetch: async () => { n++; if (n > 1) throw denied(); return { ok: true, status: 200, headers: H({ 'content-length': '4' }), body: { getReader: () => ({ read() { const e = denied(); e._once = true; return this.sent ? Promise.reject(e) : (this.sent = true, Promise.resolve({ done: false, value: chunk('ab') })); }, cancel() { return Promise.resolve(); } }) } }; } };
  let err = null;
  try { await o0('http://x/v.mp4', 4, () => {}); } catch (e) { err = e; }
  ok('T23 保存已收到的部分时仍留着权限失效这个名字', err && err.name === 'NotAllowedError' && /点重试会接着下/.test(err.message), `${err && err.name} ${err && err.message}`);
  delete globalThis.q;
  delete globalThis.window;
  delete globalThis.localStorage;
}

console.log(fail.length ? `SIM-FAIL n=${fail.length}: ${fail.join(' | ')}` : 'ALL SIM CHECKS PASS');
process.exit(fail.length ? 1 : 0);
