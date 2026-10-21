// sim-merge-fallback.mjs — 合并 OOM 后分开保存已下载的音视频(零网络, 确定性):
//   node evidence/sim-merge-fallback.mjs → exit 0 全过 / 1 失败
// 取真实 t0 源码段。o0/_0/a0/F 换成桩。断言: OOM 不把已下好的数据丢掉,
// 而是依次保存 视频.mp4 与 音频.m4a, 且不抛错; 其它错误仍抛; 合并成功只保存一个 mp4。
import fs from 'node:fs';

const fail = [];
const ok = (name, cond, extra = '') => {
  console.log((cond ? '✓ ' : '✗ ') + name + (extra ? ' | ' + extra : ''));
  if (!cond) fail.push(name);
};

const src = fs.readFileSync('bilibili-helper-content-script.js', 'utf8');
const i = src.indexOf('t0=async');
const j = src.indexOf(';window.addEventListener("beforeunload"', i);
const seg = src.slice(i, j);
ok('S0 取到真实t0且含分开保存', seg.startsWith('t0=async') && seg.includes('o+"_视频.mp4"') && seg.includes('o+"_音频.m4a"') && seg.includes('q.mergeNote="已分开保存音视频"'));

function mk() {
  const n = { children: [], style: {}, className: '', textContent: '', innerHTML: '' };
  n.classList = { add() {}, remove() {}, toggle() {} };
  n.appendChild = (c) => { n.children.push(c); return c; };
  n.querySelectorAll = () => n.children.filter((c) => c && c.download);
  return n;
}
const document = { createElement: () => mk() };
const esc = (s) => String(s);
const C = () => '1B';
const F = () => ({ baseUrl: 'ext' });
const R = async () => { throw new Error('R should not run'); };

function run(mode) {
  const saved = [];
  const logs = [];
  let merges = 0;
  const q = { mergeEl: null, mergeNote: '', splitGap: 0, mergeMax: mode === 'big' ? 10 : undefined, ffmpegInstance: null, ffmpegUsedFiles: new Set(), blobUrls: new Set() };
  const o0 = async (url) => ({ url, bytes: url.length, size: mode === 'big' ? 8 : 0 });
  const _0 = async () => {
    merges++;
    if (mode === 'oom') throw new Error('memory access out of bounds');
    if (mode === 'other') throw new Error('exec failed');
    return [new Uint8Array([1, 2, 3]).buffer, () => {}];
  };
  const a0 = (data, name, parent) => {
    saved.push(name + ':' + (data && data.url));
    parent && parent.appendChild({ download: name, getAttribute: (k) => (k === 'download' ? name : 'blob:' + name) });
  };
  const v = (...a) => logs.push(a.join(' '));
  const t0 = new Function('o0', '_0', 'a0', 'F', 'q', 'v', 'esc', 'C', 'document', 'R', `var ${seg}; return t0;`)(o0, _0, a0, F, q, v, esc, C, document, R);
  const btn = { classList: { add() {}, remove() {} } };
  const status = mk();
  return { t0, q, saved, logs, merges, status, btn, parts: [{ url: 'audio-url', size: 2 }, { url: 'video-url', size: 9 }] };
}

const oom = run('oom');
let oomErr = null;
try { await oom.t0(true, oom.btn, oom.parts, '001_课', oom.status); } catch (e) { oomErr = e; }
ok('T1 OOM不抛错', oomErr === null, String(oomErr && oomErr.message));
ok('T1 先视频后音频', oom.saved.join('|') === '001_课_视频.mp4:video-url|001_课_音频.m4a:audio-url', oom.saved.join('|'));
ok('T1 状态与日志说明分开保存', oom.status.innerHTML.includes('分开保存') && oom.q.mergeNote === '已分开保存音视频' && oom.logs.some((x) => x.includes('分开保存音视频')));

const bad = run('other');
let badErr = null;
try { await bad.t0(true, bad.btn, bad.parts, '002_课', bad.status); } catch (e) { badErr = e; }
ok('T2 非OOM仍抛错且不分开保存', !!badErr && /exec failed/.test(badErr.message) && bad.saved.length === 0, String(badErr && badErr.message));

const good = run('ok');
await good.t0(true, good.btn, good.parts, '003_课', good.status);
ok('T3 合并成功只保存一个mp4', good.saved.join('|') === '003_课.mp4:undefined' && good.q.mergeNote === '' && good.status.innerHTML === '已完成', good.saved.join('|') + ' / ' + good.status.innerHTML);

const big = run('big');
let bigErr = null;
try { await big.t0(true, big.btn, big.parts, '004_课', big.status); } catch (e) { bigErr = e; }
ok('T4 超过上限不进wasm', bigErr === null && big.merges === 0 && big.saved.join('|') === '004_课_视频.mp4:video-url|004_课_音频.m4a:audio-url', `merges=${big.merges} ${big.saved.join('|')}`);
ok('T4 记下可再点的保存链接', big.status.innerHTML.includes('超过浏览器合并上限') && big.q.mergeSaves && big.q.mergeSaves.map((s) => s.name).join('|') === '004_课_视频.mp4|004_课_音频.m4a');

console.log(fail.length ? `SIM-FAIL n=${fail.length}: ${fail.join(' | ')}` : 'ALL SIM CHECKS PASS');
process.exit(fail.length ? 1 : 0);
