import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../bilibili-helper-content-script.js', import.meta.url), 'utf8');
const qi = page.indexOf('qM=(v,a)=>');
const qj = page.indexOf(',t0=async', qi);
const qM = new Function(page.slice(qi, qj) + '\nreturn qM;')();

const fail = [];
const ok = (name, cond, extra) => {
  console.log((cond ? '✓' : '✗') + ' ' + name + (extra && !cond ? ' | ' + extra : ''));
  if (!cond) fail.push(name);
};
const w32 = (b, o, n) => { n >>>= 0; b[o] = n >>> 24; b[o + 1] = (n >>> 16) & 255; b[o + 2] = (n >>> 8) & 255; b[o + 3] = n & 255; };
const r32 = (b, o) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
const r64 = (b, o) => r32(b, o) * 4294967296 + r32(b, o + 4);
const box = (type, payload) => {
  const b = new Uint8Array(8 + payload.length);
  w32(b, 0, b.length);
  b.set([...type].map((c) => c.charCodeAt(0)), 4);
  b.set(payload, 8);
  return b;
};
const cat = (...xs) => {
  const n = xs.reduce((s, x) => s + x.length, 0);
  const o = new Uint8Array(n);
  let p = 0;
  for (const x of xs) { o.set(x, p); p += x.length; }
  return o;
};
const ftyp = () => box('ftyp', new Uint8Array([105, 115, 111, 109, 0, 0, 0, 1]));
const mvhd = () => {
  const body = new Uint8Array(100);
  w32(body, 12, 1000);
  w32(body, 16, 2000);
  w32(body, 20, 0x00010000);
  body[24] = 1;
  w32(body, 96, 2);
  return box('mvhd', body);
};
const trak = (id, chunkOff) => {
  const tk = new Uint8Array(32);
  w32(tk, 0, 32);
  tk.set([116, 107, 104, 100], 4);
  w32(tk, 20, id);
  const pay = new Uint8Array(12);
  w32(pay, 4, 1);
  w32(pay, 8, chunkOff >>> 0);
  return box('trak', cat(tk, box('stco', pay)));
};
const basic = (id, payload, chunkOff) => cat(ftyp(), box('moov', cat(mvhd(), trak(id, chunkOff))), box('mdat', payload));
function makeBasic(tag) {
  const payload = new TextEncoder().encode(tag);
  const ft = ftyp();
  const tkLen = trak(1, 0).length;
  const moov = box('moov', cat(mvhd(), trak(1, 0)));
  const off = ft.length + moov.length + 8;
  return cat(ft, box('moov', cat(mvhd(), trak(1, off))), box('mdat', payload));
}
function findAscii(buf, s) {
  const t = new TextEncoder().encode(s);
  outer: for (let i = 0; i + t.length <= buf.length; i++) {
    for (let j = 0; j < t.length; j++) if (buf[i + j] !== t[j]) continue outer;
    return i;
  }
  return -1;
}
function boxes(b) {
  const out = [];
  let o = 0;
  while (o + 8 <= b.length) {
    const size = r32(b, o);
    const type = String.fromCharCode(b[o + 4], b[o + 5], b[o + 6], b[o + 7]);
    out.push({ type, start: o, size });
    o += size;
  }
  return out;
}
const video = makeBasic('VIDE');
const audio = makeBasic('AUDI');
const merged = qM(video, audio);
ok('B1 普通mp4能合并', merged && findAscii(merged, 'VIDE') >= 0 && findAscii(merged, 'AUDI') >= 0, merged && merged.length);
const ids = [];
if (merged) {
  for (let i = 0; i + 8 < merged.length; i++) {
    if (String.fromCharCode(merged[i + 4], merged[i + 5], merged[i + 6], merged[i + 7]) === 'tkhd' && r32(merged, i) === 32) ids.push(r32(merged, i + 20));
  }
}
ok('B2 音轨号改成2', ids.join(',') === '1,2', ids.join(','));
let stcoOk = false;
if (merged) {
  const offs = [];
  for (let i = 0; i + 20 < merged.length; i++) {
    if (String.fromCharCode(merged[i + 4], merged[i + 5], merged[i + 6], merged[i + 7]) === 'stco') offs.push(r32(merged, i + 16));
  }
  stcoOk = offs.length === 2 && new TextDecoder().decode(merged.slice(offs[0], offs[0] + 4)) === 'VIDE' && new TextDecoder().decode(merged.slice(offs[1], offs[1] + 4)) === 'AUDI';
  ok('B3 偏移指向各自的样本', stcoOk, offs.join(','));
} else ok('B3 偏移指向各自的样本', false, 'no merge');

function moofPair(id, payload, base) {
  const tfPay = new Uint8Array(16);
  tfPay[3] = 1;
  w32(tfPay, 4, id);
  const hi = Math.floor(base / 4294967296);
  w32(tfPay, 8, hi);
  w32(tfPay, 12, base);
  const moof = box('moof', box('traf', box('tfhd', tfPay)));
  const mdat = box('mdat', payload);
  return { moof, mdat };
}
function makeFrag(tag) {
  const payload = new TextEncoder().encode(tag);
  const ft = ftyp();
  const tk = new Uint8Array(32);
  w32(tk, 0, 32);
  tk.set([116, 107, 104, 100], 4);
  w32(tk, 20, 1);
  const trex = box('trex', (() => { const p = new Uint8Array(20); w32(p, 4, 1); return p; })());
  const moov = box('moov', cat(mvhd(), box('trak', tk), box('mvex', trex)));
  const base = ft.length + moov.length + box('moof', box('traf', box('tfhd', new Uint8Array(16)))).length + 8;
  const pair = moofPair(1, payload, base);
  const realBase = ft.length + moov.length + pair.moof.length + 8;
  const pair2 = moofPair(1, payload, realBase);
  return cat(ft, moov, pair2.moof, pair2.mdat);
}
const fv = makeFrag('VIDE');
const fa = makeFrag('AUDI');
const fm = qM(fv, fa);
ok('F1 分片mp4能合并', fm && findAscii(fm, 'VIDE') >= 0 && findAscii(fm, 'AUDI') >= 0);
let bases = [];
if (fm) {
  for (let i = 0; i + 24 < fm.length; i++) {
    if (String.fromCharCode(fm[i + 4], fm[i + 5], fm[i + 6], fm[i + 7]) === 'tfhd') bases.push({ id: r32(fm, i + 12), base: r64(fm, i + 16) });
  }
}
const fOk = bases.length === 2 && bases[0].id === 1 && bases[1].id === 2 && new TextDecoder().decode(fm.slice(bases[0].base, bases[0].base + 4)) === 'VIDE' && new TextDecoder().decode(fm.slice(bases[1].base, bases[1].base + 4)) === 'AUDI';
ok('F2 分片偏移和音轨号正确', fOk, JSON.stringify(bases));

function makeLoose(tag) {
  const payload = new TextEncoder().encode(tag);
  const ft = ftyp();
  const tk = new Uint8Array(32);
  w32(tk, 0, 32);
  tk.set([116, 107, 104, 100], 4);
  w32(tk, 20, 1);
  const trex = box('trex', (() => { const p = new Uint8Array(20); w32(p, 4, 1); return p; })());
  const moov = box('moov', cat(mvhd(), box('trak', tk), box('mvex', trex)));
  const tfPay = new Uint8Array(8);
  w32(tfPay, 4, 1);
  const trunPay = new Uint8Array(12);
  trunPay[3] = 1;
  w32(trunPay, 4, 1);
  const moofLen = 8 + 8 + box('tfhd', tfPay).length + box('trun', trunPay).length;
  w32(trunPay, 8, ft.length + moov.length + moofLen + 8);
  const moof = box('moof', box('traf', cat(box('tfhd', tfPay), box('trun', trunPay))));
  return cat(ft, moov, moof, box('mdat', payload));
}
const lv = makeLoose('VIDE');
const la = makeLoose('AUDI');
const lm = qM(lv, la);
let looseOk = false;
let looseNote = '';
if (lm) {
  const hits = [];
  const walk = (start, end, moofStart) => {
    let o = start;
    while (o + 8 <= end) {
      const size = r32(lm, o);
      if (size < 8 || o + size > end) break;
      const type = String.fromCharCode(lm[o + 4], lm[o + 5], lm[o + 6], lm[o + 7]);
      if (type === 'moof') walk(o + 8, o + size, o);
      else if (type === 'traf') walk(o + 8, o + size, moofStart);
      else if (type === 'trun' && moofStart != null) {
        const rel = r32(lm, o + 16);
        hits.push(new TextDecoder().decode(lm.slice(moofStart + rel, moofStart + rel + 4)));
      }
      o += size;
    }
  };
  walk(0, lm.length, null);
  const flagOn = [];
  for (let i = 0; i + 16 < lm.length; i++) {
    if (String.fromCharCode(lm[i + 4], lm[i + 5], lm[i + 6], lm[i + 7]) === 'tfhd') flagOn.push((r32(lm, i + 8) & 131072) !== 0);
  }
  looseOk = hits.join(',') === 'VIDE,AUDI' && flagOn.length === 2 && flagOn.every(Boolean);
  looseNote = hits.join(',') + ' flags=' + flagOn.join(',');
}
ok('F3 没有基准偏移的分片也能合并', looseOk, looseNote || 'no merge ' + qM.why);

function makeGap(tag) {
  const payload = new TextEncoder().encode(tag);
  const ft = ftyp();
  const tk = new Uint8Array(32);
  w32(tk, 0, 32);
  tk.set([116, 107, 104, 100], 4);
  w32(tk, 20, 1);
  const trex = box('trex', (() => { const p = new Uint8Array(20); w32(p, 4, 1); return p; })());
  const moov = box('moov', cat(mvhd(), box('trak', tk), box('mvex', trex)));
  const free = box('free', new Uint8Array(8));
  const dummy = moofPair(1, payload, 0);
  const base = ft.length + moov.length + dummy.moof.length + free.length + 8;
  const pair = moofPair(1, payload, base);
  return cat(ft, moov, pair.moof, free, pair.mdat);
}
const gv = makeGap('VIDE');
const ga = makeGap('AUDI');
const gm = qM(gv, ga);
let gapBases = [];
if (gm) {
  for (let i = 0; i + 24 < gm.length; i++) {
    if (String.fromCharCode(gm[i + 4], gm[i + 5], gm[i + 6], gm[i + 7]) === 'tfhd') gapBases.push(r64(gm, i + 16));
  }
}
const gapOk = gapBases.length === 2 && new TextDecoder().decode(gm.slice(gapBases[0], gapBases[0] + 4)) === 'VIDE' && new TextDecoder().decode(gm.slice(gapBases[1], gapBases[1] + 4)) === 'AUDI';
ok('F4 分片和数据之间夹了别的盒子也能合并', gapOk, JSON.stringify(gapBases) + (qM.why ? ' ' + qM.why : ''));
ok('N1 乱数据返回空', qM(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]), new Uint8Array(16)) === null);
ok('N2 一个分片一个普通不硬合', qM(video, fa) === null);

const seg = page.slice(qi, page.indexOf(';window.addEventListener("beforeunload"', qi));
const saved = [];
let merges = 0;
const q = { mergeEl: null, mergeNote: '', splitGap: 0, ffmpegInstance: null, ffmpegUsedFiles: new Set(), blobUrls: new Set() };
const bytesOf = (u) => { const c = new Uint8Array(u.length); c.set(u); return c.buffer; };
const blobs = { 'audio-url': audio, 'video-url': video };
let mode = 'small';
const o0 = async (url) => ({ url, size: mode === 'big' ? 500 * 1024 * 1024 : mode === 'midboom' ? 250 * 1024 * 1024 : blobs[url].length, arrayBuffer: mode === 'nowasm' ? undefined : async () => { if (mode === 'midboom') throw new Error('alloc'); return bytesOf(blobs[url]); } });
const _0 = async () => { merges++; throw new Error('wasm should not run'); };
const a0 = (data, name) => { saved.push(name + ':' + (data && data.length) + ':' + (data && findAscii(data, 'VIDE') >= 0 && findAscii(data, 'AUDI') >= 0)); };
const vlog = () => {};
function mk() {
  const n = { children: [], style: {}, className: '', textContent: '', innerHTML: '' };
  n.classList = { add() {}, remove() {}, toggle() {} };
  n.appendChild = (c) => { n.children.push(c); return c; };
  n.querySelectorAll = () => [];
  return n;
}
const t0 = new Function('o0', '_0', 'a0', 'F', 'q', 'v', 'esc', 'C', 'document', 'R', `var ${seg}; return t0;`)(o0, _0, a0, () => ({ baseUrl: 'ext' }), q, vlog, (s) => String(s), () => '1B', { createElement: () => mk() }, async () => { throw new Error('R'); });
let wireErr = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 1 }, { url: 'video-url', size: 1 }], '006_课', mk()); } catch (e) { wireErr = e; }
ok('W1 页面内合并成功则不进wasm', wireErr === null && merges === 0 && saved.length === 1 && saved[0].startsWith('006_课.mp4:') && saved[0].endsWith(':true'), `merges=${merges} ${saved.join('|')} ${wireErr && wireErr.message}`);
saved.length = 0;
mode = 'big';
q.mergeNote = '';
let wire2 = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 1 }, { url: 'video-url', size: 1 }], '007_课', mk()); } catch (e) { wire2 = e; }
ok('W2 超过400MB仍在页面内合并且不进ffmpeg', wire2 === null && merges === 0 && saved.length === 1 && saved[0].startsWith('007_课.mp4:') && saved[0].endsWith(':true'), `merges=${merges} ${saved.join('|')} ${wire2 && wire2.message}`);
saved.length = 0;
mode = 'midboom';
q.mergeNote = '';
let wire3 = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 1 }, { url: 'video-url', size: 1 }], '008_课', mk()); } catch (e) { wire3 = e; }
ok('W3 400到700MB复制失败也不进ffmpeg', wire3 === null && merges === 0 && saved.length === 2 && saved[0].includes('008_课_视频.mp4') && saved[1].includes('008_课_音频.m4a'), `merges=${merges} ${saved.join('|')} ${wire3 && wire3.message}`);
saved.length = 0;
mode = 'nowasm';
q.noWasm = true;
q.mergeNote = '';
let wire4 = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 1 }, { url: 'video-url', size: 1 }], '009_课', mk()); } catch (e) { wire4 = e; }
q.noWasm = false;
ok('W4 上次撑住浏览器的这一集重试不再进ffmpeg', wire4 === null && merges === 0 && saved.length === 2 && saved[0].includes('009_课_视频.mp4') && saved[1].includes('009_课_音频.m4a'), `merges=${merges} ${saved.join('|')} ${wire4 && wire4.message}`);

const z0 = page.indexOf('_0=async');
const z1 = page.indexOf('var U=', z0);
const run0 = new Function('T0', 'D', 'qK', 'q', 'f', 'v', page.slice(z0, z1) + '\nreturn _0;');
async function bootCase(size, failFirst) {
  let boots = 0;
  const q = { _oomR: 0, mergeEl: null };
  const logs = [];
  const T0 = async () => {
    boots++;
    const mine = boots;
    return {
      writeFile: async () => { if (failFirst && mine === 1) throw new Error('RuntimeError: memory access out of bounds'); },
      exec: async () => {},
      deleteFile: async () => {},
      readFile: async () => ({ buffer: new ArrayBuffer(4) }),
    };
  };
  const _0 = run0(T0, async (x) => x, () => {}, q, () => {}, (m) => logs.push(m));
  let err = null;
  try { await _0('ext', { size }, { size }); } catch (e) { err = e; }
  return { boots, err, logs };
}
const small = await bootCase(10 * 1024 * 1024, true);
ok('R1 小文件内存不足会换新合并器再试一次', small.err === null && small.boots === 2, `boots=${small.boots} ${small.err && small.err.message}`);
const large = await bootCase(100 * 1024 * 1024, true);
ok('R2 大文件内存不足不再重试', large.err && /memory access out of bounds/.test(large.err.message) && large.boots === 1 && large.logs.some((m) => m.includes('不再重试')), `boots=${large.boots} ${large.logs.join('|')}`);

console.log(fail.length ? `SIM-FAIL n=${fail.length}: ${fail.join(' | ')}` : 'ALL SIM CHECKS PASS');
process.exit(fail.length ? 1 : 0);
