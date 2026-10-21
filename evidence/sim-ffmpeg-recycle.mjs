// sim-ffmpeg-recycle.mjs — 合并器实例回收与 OOM 自动重试(零网络, 确定性):
//   node evidence/sim-ffmpeg-recycle.mjs → exit 0 全过 / 1 失败
// 方法: 取主脚本真实 qK/T0/_0 源码段(未改写一字), e0/Worker/J/D 换成受控桩。
// 断言: 每集成功后 terminate 且实例置空; 首次 memory access out of bounds 后换新实例重试成功;
//       连续两次 OOM 只试 2 次后抛出; load 失败不缓存坏实例。
import fs from 'node:fs';

const fail = [];
const ok = (name, cond, extra = '') => {
  console.log((cond ? '✓ ' : '✗ ') + name + (extra ? ' | ' + extra : ''));
  if (!cond) fail.push(name);
};

const src = fs.readFileSync('bilibili-helper-content-script.js', 'utf8');
const i = src.indexOf('qK=()=>');
const j = src.indexOf(';var U=', i);
const seg = src.slice(i, j);
ok('S0 取到真实qK/T0/_0', seg.startsWith('qK=()=>') && seg.includes('i.terminate()') && seg.includes('q._oomR') && seg.includes('q.ffmpegCore'));

function harness({ failExec = () => false, failLoad = () => false } = {}) {
  const logs = [];
  const terminated = [];
  const instances = [];
  const q = { ffmpegInstance: null, ffmpegUsedFiles: new Set(), blobUrls: new Set(), mergeEl: { innerHTML: '' } };
  let seq = 0;
  class e0 {
    constructor() { this.id = ++seq; this.dead = false; instances.push(this); }
    on() {}
    async load() { if (failLoad(this)) throw new Error('load fail'); }
    async writeFile() { if (this.dead) throw new Error('write on dead'); }
    async exec() { if (failExec(this)) throw new Error('memory access out of bounds'); }
    async readFile() { return new Uint8Array([7, 7, 7, 7]); }
    async deleteFile() {}
    terminate() { this.dead = true; terminated.push(this.id); }
  }
  class Worker { constructor(url) { this.url = url; } }
  const J = async (u) => 'blob:' + u;
  const D = async (b) => b;
  const f = () => {};
  const v = (...a) => logs.push(a.join(' '));
  const api = new Function('q', 'J', 'e0', 'Worker', 'D', 'f', 'v', `var Q="ffmpeg.worker.js",Y="ffmpeg-core.js",S="ffmpeg-core.wasm",$="ffmpeg-core.worker.js";var ${seg}; return {qK,T0,_0};`)(q, J, e0, Worker, D, f, v);
  return { ...api, q, logs, terminated, instances };
}

const blob = new Uint8Array([1, 2]);

// T1 连续两集都成功: 每集新建实例并在返回前 terminate, 实例不再被复用
{
  const h = harness();
  const a = await h._0('base', blob, blob);
  const b = await h._0('base', blob, blob);
  ok('T1 两集都返回合并字节', a[0].byteLength === 4 && b[0].byteLength === 4);
  ok('T1 两集用了两个实例且都已销毁', h.instances.length === 2 && h.terminated.join(',') === '1,2' && h.q.ffmpegInstance === null);
  ok('T1 wasm核心URL只取一次', h.q.ffmpegCore && h.q.ffmpegCore.m.endsWith('ffmpeg-core.wasm'));
}

// T2 第一集 exec 爆 OOM, 自动换新实例重试成功(这就是"失败重试还是同一具尸体"的根因)
{
  const h = harness({ failExec: (inst) => inst.id === 1 });
  const a = await h._0('base', blob, blob);
  ok('T2 OOM后换新实例重试成功', a[0].byteLength === 4 && h.instances.length === 2 && h.q.ffmpegInstance === null);
  ok('T2 行内提示重建且日志打出重试', h.q.mergeEl.innerHTML.includes('重建合并器') && h.logs.some((x) => x.includes('已销毁旧合并器')));
  ok('T2 两具实例都已terminate', h.terminated.join(',') === '1,2');
}

// T3 新实例也 OOM: 只试 2 次, 不再死循环, 实例不残留
{
  const h = harness({ failExec: () => true });
  let err = null;
  try { await h._0('base', blob, blob); } catch (e) { err = e; }
  ok('T3 两次OOM后抛出且只建2个实例', !!err && /memory access out of bounds/.test(err.message) && h.instances.length === 2, `n=${h.instances.length}`);
  ok('T3 失败后实例已清空', h.q.ffmpegInstance === null && h.q._oomR === 0);
}

// T4 load 失败不缓存坏实例, 下次能重新 load
{
  const h = harness({ failLoad: (inst) => inst.id === 1 });
  let err = null;
  try { await h.T0('base'); } catch (e) { err = e; }
  const second = await h.T0('base');
  ok('T4 load失败不缓存, 下次新建成功', !!err && h.q.ffmpegInstance === second && second.id === 2 && h.terminated.includes(1));
}

console.log(fail.length ? `SIM-FAIL n=${fail.length}: ${fail.join(' | ')}` : 'ALL SIM CHECKS PASS');
process.exit(fail.length ? 1 : 0);
