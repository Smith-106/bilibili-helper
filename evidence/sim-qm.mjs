import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../bilibili-helper-content-script.js', import.meta.url), 'utf8');
const seed = readFileSync(new URL('../bilibili-helper-content-script-seed.js', import.meta.url), 'utf8');
const qi = page.indexOf('qM=(v,a)=>');
const qj = page.indexOf(',t0=async', qi);
const qM = new Function(page.slice(qi, qj) + '\nreturn qM;')();
globalThis.performance = { memory: { usedJSHeapSize: 1, jsHeapSizeLimit: 1024 * 1024 * 1024 } };

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
async function u8(x) { if (!x) return null; if (x instanceof Uint8Array) return x; return new Uint8Array(await x.arrayBuffer()); }
const video = makeBasic('VIDE');
const audio = makeBasic('AUDI');
const merged = await u8(qM(video, audio));
ok('B1 普通mp4能合并', merged && findAscii(merged, 'VIDE') >= 0 && findAscii(merged, 'AUDI') >= 0, merged && merged.length);
ok('M1 合并结果是分段Blob不再整段复制', qM(video, audio) instanceof Blob, '');
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
const fm = await u8(qM(fv, fa));
ok('F1 分片mp4能合并', fm && findAscii(fm, 'VIDE') >= 0 && findAscii(fm, 'AUDI') >= 0);
ok('M2 分片合并结果也是分段Blob', qM(fv, fa) instanceof Blob, '');
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
const lm = await u8(qM(lv, la));
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
const gm = await u8(qM(gv, ga));
let gapBases = [];
if (gm) {
  for (let i = 0; i + 24 < gm.length; i++) {
    if (String.fromCharCode(gm[i + 4], gm[i + 5], gm[i + 6], gm[i + 7]) === 'tfhd') gapBases.push(r64(gm, i + 16));
  }
}
const gapOk = gapBases.length === 2 && new TextDecoder().decode(gm.slice(gapBases[0], gapBases[0] + 4)) === 'VIDE' && new TextDecoder().decode(gm.slice(gapBases[1], gapBases[1] + 4)) === 'AUDI';
ok('F4 分片和数据之间夹了别的盒子也能合并', gapOk, JSON.stringify(gapBases) + (qM.why ? ' ' + qM.why : ''));
function makeEof(tag) {
  const file = makeFrag(tag);
  let o = 0;
  let last = 0;
  while (o + 8 <= file.length) {
    const size = r32(file, o);
    if (size < 8 || o + size > file.length) break;
    last = o;
    o += size;
  }
  w32(file, last, 0);
  return file;
}
const ev = makeEof('VIDE');
const ea = makeEof('AUDI');
const em = await u8(qM(ev, ea));
let eofWalk = 0;
let eofCovered = false;
if (em) {
  let o = 0;
  while (o + 8 <= em.length) {
    const size = r32(em, o);
    if (size < 8 || o + size > em.length) break;
    eofWalk++;
    o += size;
  }
  eofCovered = o === em.length && eofWalk >= 4;
}
ok('F5 长度到文件尾的数据块合并后仍能分开音视频', !!em && eofCovered && findAscii(em, 'VIDE') >= 0 && findAscii(em, 'AUDI') >= 0, `walk=${eofWalk} covered=${eofCovered} ${qM.why || ''}`);
{
  const multiV = cat(ftyp(), box('moov', cat(mvhd(), trak(1, 0), trak(2, 0))), box('mdat', new Uint8Array([1])));
  const multiA = basic(1, new Uint8Array([2]), 80);
  const multi = qM(multiV, multiA);
  ok('F6 不止一条轨道时说明原因', multi == null && qM.why === '视频不止一条轨道', qM.why || '');
{
  const encV = cat(ftyp(), box('moov', box('sinf', new Uint8Array(4))), box('mdat', new Uint8Array([1])));
  const encA = basic(1, new Uint8Array([2]), 80);
  const enc = qM(encV, encA);
  ok('F7 加密时说明原因', enc == null && qM.why === '视频已加密', qM.why || '');
  const hidden = cat(ftyp(), box('moov', cat(mvhd(), trak(1, 80))), box('mdat', box('sinf', new Uint8Array(4))));
  const hid = qM(hidden, basic(1, new Uint8Array([2]), 80));
  ok('F8 加密只在媒体数据里也说明原因', hid == null && qM.why === '视频已加密', qM.why || '');
  const deepPay = new Uint8Array(6000);
  deepPay.set(box('sinf', new Uint8Array(4)), 5000);
  const deepHit = qM(cat(ftyp(), box('moov', cat(mvhd(), trak(1, 80))), box('mdat', deepPay)), basic(1, new Uint8Array([2]), 80));
  ok('F9 媒体数据 4KB 之后的加密也说明原因', deepHit == null && qM.why === '视频已加密', qM.why || '');
  const midPay = new Uint8Array(24000);
  midPay.set(box('sinf', new Uint8Array(4)), 20000);
  const midHit = qM(cat(ftyp(), box('moov', cat(mvhd(), trak(1, 80))), box('mdat', midPay)), basic(1, new Uint8Array([2]), 80));
  ok('F11 媒体数据 16KB 之后的加密也说明原因', midHit == null && qM.why === '视频已加密', qM.why || '');
  const farPay = new Uint8Array(44000);
  farPay.set(box('sinf', new Uint8Array(4)), 40000);
  qM.why = '';
  const farHit = qM(cat(ftyp(), box('moov', cat(mvhd(), trak(1, 80))), box('mdat', farPay)), basic(1, new Uint8Array([2]), 80));
  ok('F10 32KB 之后的加密标记先不当成加密', farHit != null || qM.why !== '视频已加密', qM.why || 'merged');
}
}
ok('N1 乱数据返回空', qM(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]), new Uint8Array(16)) === null);
ok('N2 一个分片一个普通不硬合', qM(video, fa) === null);

const seg = page.slice(qi, page.indexOf(';window.addEventListener("beforeunload"', qi));
const saved = [];
let merges = 0;
const q = { mergeEl: null, mergeNote: '', splitGap: 0, ffmpegInstance: null, ffmpegUsedFiles: new Set(), blobUrls: new Set() };
const bytesOf = (u) => { const c = new Uint8Array(u.length); c.set(u); return c.buffer; };
const blobs = { 'audio-url': audio, 'video-url': video };
let mode = 'small';
let inflight = 0, maxInflight = 0;
let arm = null;
let partWrites = null;
const o0 = async (url) => { inflight++; maxInflight = Math.max(maxInflight, inflight); await Promise.resolve(); if (arm && arm.seen === 1) { arm.saved = partWrites ? partWrites.length : saved.length; if (q.watchMark) arm.marked = String(globalThis.sessionStorage && globalThis.sessionStorage.getItem('bilibili_helper_nomerge') || '').includes(q.watchMark); arm.seen = 2; } else if (arm && arm.seen === 0) arm.seen = 1; inflight--; if (mode === 'die') throw new Error('first file died'); if (mode === 'fat') { const u = new Uint8Array(600); u.size = 600; return u; } if (mode === 'blind') { const u = new Uint8Array(4); u.size = 4; return u; } if (mode === 'blind2') { const u = new Uint8Array(2); u.size = 2; return u; } if (mode === 'needdir') { if (!q.dir) throw Object.assign(new Error('need'), { needDir: true }); return { noHold: true, streamed: true, size: 4 }; } if (mode === 'u8') return new Uint8Array(8); if (mode === 'u6') return new Uint8Array(6); if (mode === 'u4') return new Uint8Array(4); if (mode === 'blob') return new Blob([new Uint8Array(6)]); if (mode === 'alloc') return { size: 8, arrayBuffer: async () => { throw new RangeError('Array buffer allocation failed'); } }; if (mode === 'nohold') return { noHold: true, size: blobs[url].length, blob: new Blob([blobs[url]]) }; if (mode === 'parts') return { noHold: true, size: blobs[url].length, parts: [blobs[url]] }; if (mode === 'streamed') return { noHold: true, streamed: true, size: 4 }; return { url, size: mode === 'big' ? 500 * 1024 * 1024 : mode === 'midboom' ? 250 * 1024 * 1024 : blobs[url].length, arrayBuffer: mode === 'nowasm' ? undefined : async () => { if (mode === 'midboom') throw new Error('alloc'); if (mode === 'bad') return new Uint8Array(32).buffer; return bytesOf(blobs[url]); } }; };
const _0 = async () => { merges++; throw new Error(q.memBoom || 'wasm should not run'); };
const a0 = async (data, name) => { if (q.failSave && String(name).endsWith('.mp4')) { q.failSave = false; throw new Error('Invalid typed array length'); } const u = typeof Blob === 'function' && data instanceof Blob ? new Uint8Array(await data.arrayBuffer()) : data; saved.push(name + ':' + (u && u.length) + ':' + (u && findAscii(u, 'VIDE') >= 0 && findAscii(u, 'AUDI') >= 0)); };
const vlog = () => {};
function mk() {
  const n = { children: [], style: {}, className: '', textContent: '', innerHTML: '' };
  n.classList = { add() {}, remove() {}, toggle() {} };
  n.appendChild = (c) => { n.children.push(c); return c; };
  n.querySelectorAll = () => [];
  return n;
}
const cookieJar = new Map();
const pageDoc = { createElement: () => mk(), get cookie() { return [...cookieJar.entries()].map(([k, v]) => k + '=' + v).join('; '); }, set cookie(raw) { const text = String(raw), part = text.split(';')[0], i = part.indexOf('='); if (i < 0) return; const k = part.slice(0, i); if ((k === 'bhnmnow' || k.startsWith('bhx')) && !q.keepNow) return; if (k === 'bhnmfull' && !q.keepFull) return; if (text.includes('max-age=0')) cookieJar.delete(k); else cookieJar.set(k, part.slice(i + 1)); } };
const t0 = new Function('o0', '_0', 'a0', 'F', 'q', 'v', 'esc', 'C', 'document', 'R', `var ${seg}; return t0;`)(o0, _0, a0, () => ({ baseUrl: 'ext' }), q, vlog, (s) => String(s), () => '1B', pageDoc, async () => { throw new Error('R'); });
let wireErr = null;
const list1 = mk();
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 1 }, { url: 'video-url', size: 1 }], '006_课', list1); } catch (e) { wireErr = e; }
const rowA = list1.children[0] && list1.children[0].children[0] && list1.children[0].children[0].textContent;
const rowV = list1.children[1] && list1.children[1].children[0] && list1.children[1].children[0].textContent;
ok('W1 页面内合并成功则不进wasm', wireErr === null && merges === 0 && saved.length === 1 && saved[0].startsWith('006_课.mp4:') && saved[0].endsWith(':true'), `merges=${merges} ${saved.join('|')} ${wireErr && wireErr.message}`);
ok('W0 音视频排队下载不同时占两份小块', maxInflight === 1, `max=${maxInflight}`);
ok('W6 先下完的那份不再写成等待合并', rowA.includes('正在下另一份') && !String(rowA).includes('等待合并') && rowV.includes('正在合并') && rowV.includes('重试会分开保存'), `${rowA} || ${rowV}`);
saved.length = 0;
q.jsMergeMax = 10;
q.mergeNote = '';
arm = { seen: 0, saved: -1 };
const stBig = mk();
let wireBig = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '011_课', stBig); } catch (e) { wireBig = e; }
ok('W7 预告体积超过上限时下完一份就保存', wireBig === null && merges === 0 && arm.saved === 1 && saved.length === 2 && saved[0].includes('011_课_音频.m4a') && saved[1].includes('011_课_视频.mp4') && q.mergeNote.includes('不能同时放在页面里'), `savedAtSecond=${arm.saved} ${q.mergeNote} ${saved.join('|')} ${wireBig && wireBig.message}`);
q.jsMergeMax = 1200 * 1024 * 1024;
arm = null;
saved.length = 0;
mode = 'fat';
q.jsMergeMax = 1000;
q.mergeNote = '';
q.mergeWhy = '';
arm = { seen: 0, saved: -1 };
let wireFat = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 0 }, { url: 'video-url', size: 0 }], '012_课', mk()); } catch (e) { wireFat = e; }
ok('W8 实际体积已很大且下一份未知时先保存再下另一份', wireFat === null && merges === 0 && arm.saved === 1 && saved.length === 2 && q.mergeNote.includes('下一份体积未知'), `savedAtSecond=${arm.saved} ${q.mergeNote} ${saved.join('|')} ${wireFat && wireFat.message}`);
mode = 'small';
q.jsMergeMax = 1200 * 1024 * 1024;
arm = null;
saved.length = 0;
mode = 'nohold';
q.mergeNote = '';
q.mergeWhy = '';
arm = { seen: 0, saved: -1 };
let wireHold = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 1 }, { url: 'video-url', size: 1 }], '013_课', mk()); } catch (e) { wireHold = e; }
ok('W9 拼不成一整块时下完一份就保存且不进合并', wireHold === null && merges === 0 && arm.saved === 1 && saved.length === 2 && q.mergeNote.includes('页面里留不住一整块'), `savedAtSecond=${arm.saved} ${q.mergeNote} ${saved.join('|')} ${wireHold && wireHold.message}`);
mode = 'small';
arm = null;
saved.length = 0;
mode = 'parts';
q.mergeNote = '';
q.mergeWhy = '';
q.dirNote = '';
partWrites = [];
q.dir = { getFileHandle: async (name) => ({ createWritable: async () => ({ write: async (c) => { partWrites.push(name + ':' + (c.byteLength || c.length)); }, close: async () => {} }) }) };
arm = { seen: 0, saved: -1 };
let wireParts = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 1 }, { url: 'video-url', size: 1 }], '014_课', mk()); } catch (e) { wireParts = e; }
ok('W10 包不成文件时按小块写入文件夹', wireParts === null && merges === 0 && arm.saved === 1 && partWrites.length === 2 && q.mergeNote.includes('已按小块写入文件夹') && q.dirNote === '已写入所选文件夹', `writes=${partWrites.join('|')} ${q.mergeNote} ${wireParts && wireParts.message}`);
q.dir = null;
q.dirAsked = true;
arm = { seen: 0, saved: -1 };
let wireAsk = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 1 }, { url: 'video-url', size: 1 }], '015_课', mk()); } catch (e) { wireAsk = e; }
ok('W11 没有文件夹时要求先选择再重试', wireAsk && /请先选择文件夹再重试/.test(wireAsk.message) && q.dirAsked === false, `${wireAsk && wireAsk.message} asked=${q.dirAsked}`);
mode = 'small';
q.dir = null;
arm = null;
partWrites = null;
saved.length = 0;
mode = 'streamed';
q.mergeNote = '';
q.mergeWhy = '';
q.dirNote = '';
let wireStream = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 1 }, { url: 'video-url', size: 1 }], '016_课', mk()); } catch (e) { wireStream = e; }
ok('W12 边下边写入的那份不再进入合并', wireStream === null && merges === 0 && saved.length === 0 && q.mergeNote.includes('边下边写入文件夹') && q.dirNote === '已写入所选文件夹', `${q.mergeNote} saved=${saved.length} ${wireStream && wireStream.message}`);
mode = 'small';
{
  const revoked = [];
  const prev = globalThis.URL;
  globalThis.URL = { revokeObjectURL: (u) => revoked.push(u) };
  globalThis.q = { blobUrls: new Set(['blob:a', 'blob:b']), epBlobs: ['blob:a', 'blob:b'] };
  const a = page.indexOf('qRel=()=>');
  const b = page.indexOf('return n}', a);
  const qRel = new Function(page.slice(a, b + 'return n}'.length) + '\nreturn qRel;')();
  const n = qRel();
  ok('W13 下一集开始前释放上一集的下载链接', n === 2 && revoked.join(',') === 'blob:a,blob:b' && globalThis.q.epBlobs.length === 0 && !globalThis.q.blobUrls.has('blob:a'), `n=${n} ${revoked.join(',')}`);
  globalThis.URL = prev;
  delete globalThis.q;
}
saved.length = 0;
mode = 'small';
q.jsMergeMax = 10;
q.mergeNote = '';
q.mergeWhy = '';
let relAt = -1;
const prevPerf14 = globalThis.performance;
globalThis.performance = { memory: { usedJSHeapSize: 80, jsHeapSizeLimit: 100 } };
q.rel = () => { relAt = saved.length; };
let wireRel = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '017_课', mk()); } catch (e) { wireRel = e; }
ok('W14 同一集第二份开始前释放第一份链接', wireRel === null && merges === 0 && relAt === 1 && saved.length === 2, `relAt=${relAt} saved=${saved.length} ${wireRel && wireRel.message}`);
globalThis.performance = { memory: { usedJSHeapSize: 1, jsHeapSizeLimit: 1024 * 1024 * 1024 } };
let relRoom99 = 0;
q.rel = () => { relRoom99++; };
let wireRoom99 = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '017b_课', mk()); } catch (e) { wireRoom99 = e; }
ok('W99 页面还空着时先留着上一集的链接', wireRoom99 === null && relRoom99 === 0 && page.includes('if(m&&m.jsHeapSizeLimit)tight=m.usedJSHeapSize>m.jsHeapSizeLimit*0.5') && page.includes('if(tight){try{let st=document.getElementById("batch-status")'), `rel=${relRoom99} ${wireRoom99 && wireRoom99.message}`);
  ok('W100 放开上一集时说明原因', page.includes('页面已经过半，先放开上一集的链接') && page.includes('浏览器没报告剩余空间，先放开上一集的链接'), 'whyrel');
  ok('W101 重试前先写明这次分开保存', page.includes('if(h.noWasm||only){try{let st=p.querySelector&&p.querySelector(".b-st");if(!st&&p.appendChild){st=document.createElement("span");st.className="b-st";p.appendChild(st)}if(st)st.textContent=h.noWasm?" 这次分开保存，不再合成":" 正在重试";else if(o)o.textContent=h.noWasm?" 这次分开保存，不再合成":" 正在重试";else if(document.getElementById(B))v(h.noWasm?"这次分开保存，不再合成":"正在重试");else{if(!q.wasTitle)q.wasTitle=document.title;document.title=h.noWasm?"这次分开保存，不再合成":"正在重试"}}catch(_){try{if(o)o.textContent=h.noWasm?" 这次分开保存，不再合成":" 正在重试";else if(document.getElementById(B))v(h.noWasm?"这次分开保存，不再合成":"正在重试");else{if(!q.wasTitle)q.wasTitle=document.title;document.title=h.noWasm?"这次分开保存，不再合成":"正在重试"}}catch(__){try{if(!q.wasTitle)q.wasTitle=document.title;document.title=h.noWasm?"这次分开保存，不再合成":"正在重试"}catch(___){try{let n=document.getElementById("bh-retry-note")||document.createElement("div");n.id="bh-retry-note";n.textContent=h.noWasm?"这次分开保存，不再合成":"正在重试";n.style.cssText="position:fixed;top:0;left:0;z-index:2147483647;background:#f45a8d;color:#fff;padding:6px 10px";(document.body||document.documentElement).appendChild(n)}catch(____){try{localStorage.setItem("bilibili_helper_retry_note",h.noWasm?"这次分开保存，不再合成":"正在重试")}catch(_____){try{sessionStorage.setItem("bilibili_helper_retry_note",h.noWasm?"这次分开保存，不再合成":"正在重试")}catch(______){try{document.cookie="bhretry="+encodeURIComponent(h.noWasm?"这次分开保存，不再合成":"正在重试")+";path=/;max-age=86400"}catch(_______){try{window.name="bhretry:"+(h.noWasm?"这次分开保存，不再合成":"正在重试")}catch(________){try{let text=h.noWasm?"这次分开保存，不再合成":"正在重试";history.replaceState(Object.assign({},history.state,{bhretry:text}),"")}catch(_________){try{let text=h.noWasm?"这次分开保存，不再合成":"正在重试";let req=indexedDB.open("bilibili_helper_retry",1);req.onupgradeneeded=()=>{try{if(!req.result.objectStoreNames.contains("n"))req.result.createObjectStore("n")}catch(_){}};req.onsuccess=()=>{try{req.result.transaction("n","readwrite").objectStore("n").put(text,"retry")}catch(_){}}}catch(__________){try{document.documentElement.setAttribute("data-bh-retry",h.noWasm?"这次分开保存，不再合成":"正在重试")}catch(___________){try{window.postMessage({source:"bilibili-helper-retry",text:h.noWasm?"这次分开保存，不再合成":"正在重试"},"*")}catch(____________){try{alert(h.noWasm?"这次分开保存，不再合成":"正在重试")}catch(_____________){try{q.retryLine=h.noWasm?"这次分开保存，不再合成":"正在重试"}catch(_){}}}}}}}}}}}}}}}q.noWasm=!!h.noWasm'), 'retrynote');
  ok('W102 普通失败的重试先写成正在重试', page.includes('st.textContent=h.noWasm?" 这次分开保存，不再合成":" 正在重试"'), 'retryplain');
  ok('W103 重试没有状态时补上一句', page.includes('if(!st&&p.appendChild){st=document.createElement("span");st.className="b-st";p.appendChild(st)}'), 'retrymake');
  ok('W104 重试按钮写明哪些分开保存', page.includes('分开保存失败${bx0.failItems.length}集') && page.includes('重试失败${bx0.failItems.length}集，其中${bx0.failItems.filter(h=>h.noWasm).length}集分开保存') && page.includes(':`重试失败${bx0.failItems.length}集`'), 'retrybtn');
  ok('W105 重试这一轮再失败仍可再试', page.includes('if(bx0.failItems.length){let R2=') && !page.includes('if(!only&&bx0.failItems.length)'), 'retryagain');
  ok('W106 还在下载时再点会说明', page.includes('if(st)st.textContent=" 还在下载，这一轮结束后才能再试"') && page.includes('if(bx0.running){try{let st=document.getElementById("batch-status")'), 'busy');
  ok('W107 没有总状态时改按钮上的字', page.includes('a.btn-ghost') && page.includes('b.textContent="还在下载，结束后才能再试"'), 'busybtn');
  ok('W108 这一轮结束时改回按钮上的字', page.includes('if(b.textContent!=="还在下载，结束后才能再试")b.dataset.was=b.textContent') && page.includes('el.textContent=el.dataset.was;delete el.dataset.was'), 'busyback');
  ok('W109 重试前页面较满先放开上一轮', page.includes('if(only&&only.length){let tight=!0;try{let m=performance&&performance.memory;if(m&&m.jsHeapSizeLimit)tight=m.usedJSHeapSize>m.jsHeapSizeLimit*0.5}catch(_){}if(tight){try{q.rel()}catch(_){}if(o)o.textContent=" 页面较满，重试前先放开上一轮的链接"}}'), 'retryrel');
  ok('W110 重试这一集先放开它自己的链接', page.includes('el.textContent="这一集重试前已放开，若没保存成功请再下一次"') && page.includes('let named=`${String(a+1).padStart(3,"0")}_${m}`'), 'retryown');
  ok('W111 这一行列不出链接时按文件名找', page.includes('if((!list||!list.length)&&document.querySelectorAll)list=[...document.querySelectorAll("a[href]")].filter(el=>{let name=String(el.getAttribute&&el.getAttribute("download")||"");return name.indexOf(named)>=0'), 'retryname');
  ok('W112 记不住链接时仍按记下的文件名放开', page.includes('q0=(e,name,size)=>{q.blobUrls.add(e);(q.epBlobs||(q.epBlobs=[])).push(e);if(name){(q.epNames||(q.epNames={}))[e]=String(name)}if(size>0){(q.epSizes||(q.epSizes={}))[e]=size}}') && page.includes('q0(N,i||q.saveAs||"",b.size)') && page.includes('if(nm.indexOf(named)<0&&!(m&&(nm===String(m)||nm.slice(-String(m).length-1)==="_"+m)))continue'), 'epnames');
  ok('W113 没带文件名时用这一集的名字', page.includes('q.saveAs=`${String(a+1).padStart(3,"0")}_${m}`;try{await t0(!0,p,S,q.saveAs,_,bh)}finally{q.noWasm=!1;q.saveAs=""}'), 'saveas');
  ok('W114 单集也记下名字', page.includes('q.saveAs=K||"单集"') && page.includes('.then(()=>{q.saveAs="";m()},err=>{q.saveAs="";fail(err)})'), 'onesave');
  ok('W115 没有名字也点不了的旧链接会放开', page.includes('没有名字也点不了的旧链接已放开') && page.includes('document.querySelectorAll("a[href]")'), 'orphan');
  ok('W116 页面较满时放开还能点但没名字的链接', page.includes('if(els.length&&!full&&!blindFull)continue') && page.includes('页面较满，没记下名字的链接已放开') && page.includes('full=m.usedJSHeapSize>m.jsHeapSizeLimit*0.5'), 'fullname');
  ok('W117 不报告剩余空间时无名大链接会放开', page.includes('let blindFull=blind&&blindSum>(q.holdMax||128*1024*1024)') && page.includes('浏览器没报告剩余空间，没记下名字的大链接已放开'), 'blindbig');
  ok('W118 这一行写不上时改写到总状态', page.includes('else if(o)o.textContent=h.noWasm?" 这次分开保存，不再合成":" 正在重试"') && page.includes('catch(_){try{if(o)o.textContent=h.noWasm?" 这次分开保存，不再合成":" 正在重试";else if(document.getElementById(B))v(h.noWasm?"这次分开保存，不再合成":"正在重试")'), 'rowmiss');
  ok('W119 总状态也没有时写进日志', page.includes('else if(document.getElementById(B))v(h.noWasm?"这次分开保存，不再合成":"正在重试")'), 'rowlog');
  ok('W120 日志也没有时改标签，结束再改回', page.includes('if(!q.wasTitle)q.wasTitle=document.title;document.title=h.noWasm?"这次分开保存，不再合成":"正在重试"') && page.includes('try{if(q.wasTitle){document.title=q.wasTitle;q.wasTitle=""}}catch(_){}'), 'wastitle');
  ok('W121 标签也改不了时在页面上补一句', page.includes('n.id="bh-retry-note"') && page.includes('background:#f45a8d') && page.includes('try{let n=document.getElementById("bh-retry-note");n&&n.remove()}catch(_){}'), 'retrynote2');
  ok('W122 页面上也加不了时先记下，下次开始再写', page.includes('localStorage.setItem("bilibili_helper_retry_note",h.noWasm?"这次分开保存，不再合成":"正在重试")') && page.includes('if(note&&o){o.textContent=(o.textContent||"")+((o.textContent||"").trim()?"；":" ")+note;drop()'), 'retrynote3');
  ok('W124 总状态不在时补到页面上，本机记不住就用临时记录', page.includes('else if(note){try{let n=document.getElementById("bh-retry-note")') && page.includes('sessionStorage.setItem("bilibili_helper_retry_note",h.noWasm?"这次分开保存，不再合成":"正在重试")') && page.includes('if(!note)try{note=sessionStorage.getItem("bilibili_helper_retry_note")||""}catch(__){}'), 'retrynote5');
  ok('W125 存储都没有时改用网站记录和标签页', page.includes('document.cookie="bhretry="+encodeURIComponent(h.noWasm?"这次分开保存，不再合成":"正在重试")') && page.includes('window.name="bhretry:"') && page.includes('(?:^|; )bhretry=') && page.includes('document.cookie="bhretry=;path=/;max-age=0"'), 'retrynote6');
  ok('W126 网站记录和标签页也没有时记在浏览记录里', page.includes('history.replaceState(Object.assign({},history.state,{bhretry:text}),"")') && page.includes('history.state&&history.state.bhretry') && page.includes('delete st.bhretry;history.replaceState(st,"")'), 'retrynote7');
  ok('W127 浏览记录也没有时记进本地数据库', page.includes('indexedDB.open("bilibili_helper_retry",1)') && page.includes('.put(text,"retry")') && page.includes('.get("retry")') && page.includes('.delete("retry")') && page.includes('setTimeout(()=>fin(""),1500)'), 'retrynote8');
  ok('W128 没有本地数据库时写在页面根上', page.includes('document.documentElement.setAttribute("data-bh-retry",h.noWasm?"这次分开保存，不再合成":"正在重试")') && page.includes('getAttribute("data-bh-retry")') && page.includes('removeAttribute("data-bh-retry")') && page.includes('source:"bilibili-helper-retry"'), 'retrynote9');
  ok('W129 页面根和扩展都写不上时才弹窗', page.includes('catch(____________){try{alert(h.noWasm?"这次分开保存，不再合成":"正在重试")}catch(_____________){'), 'retrynote10');
  ok('W130 弹窗也出不来时写进结果行', page.includes('q.retryLine=h.noWasm?"这次分开保存，不再合成":"正在重试"') && page.includes('if(q.retryLine)shown+="；"+q.retryLine') && page.includes('+(q.retryLine?"；"+q.retryLine:"")') && page.includes('${q.retryLine?"；"+esc(q.retryLine):""}'), 'retrynote11');
  ok('W131 结果行写不上时先记进失败记录', page.includes('try{bx0.failLog.push(`${a+1}. ${h.title} — ${shown}`);q.retryLine=""}catch(_){}') && page.indexOf('bx0.failLog.push(`${a+1}. ${h.title} — ${shown}`)') < page.indexOf('p.classList.add("b-fail")') && page.includes('if(wrote)q.retryLine=""'), 'retrynote12');
  ok('W132 失败记录和收尾都写不上时留到下一轮', page.includes('if(q.retryLine)note=note?note+"；"+q.retryLine:q.retryLine') && page.includes('i.textContent=q.retryLine') && page.includes('if(wrote)q.retryLine=""') && page.includes('q.retryLine=""};'), 'retrynote13');
  ok('W133 关页时把内存里的说明写进本机记录', page.includes('if(!q.hideRetry){q.hideRetry=1;try{addEventListener("pagehide"') && page.includes('localStorage.setItem("bilibili_helper_retry_note",text)') && page.includes('window.name="bhretry:"+text') && page.includes('setAttribute("data-bh-retry",text)'), 'retrynote14');
  ok('W134 关页时再交给扩展自己留一份', page.includes('window.postMessage({source:"bilibili-helper-retry",text:text},"*")') && seed.includes('chrome.storage.local.set({bhRetryNote:d.text})') && seed.includes('chrome.storage.local.get("bhRetryNote"') && seed.includes('chrome.storage.local.remove("bhRetryNote")'), 'retrynote15');
  ok('W135 扩展本地记录没有时再写同步记录', seed.includes('chrome.storage.sync.set({bhRetryNote:d.text})') && seed.includes('chrome.storage.sync.get("bhRetryNote"') && seed.includes('chrome.storage.sync.remove("bhRetryNote")'), 'retrynote16');
  ok('W136 同步记录没有时再写本次浏览记录', seed.includes('chrome.storage.session.set({bhRetryNote:d.text})') && seed.includes('chrome.storage.session.get("bhRetryNote"') && seed.includes('chrome.storage.session.remove("bhRetryNote")'), 'retrynote17');
  ok('W137 浏览器把这一页收起再打开时放开按钮', page.includes('addEventListener("pageshow",ev=>{if(!ev.persisted||!bx0.running)return;bx0.running=!1') && page.includes('这一轮被浏览器收起，按钮已放开，可以再下') && page.includes('el.textContent==="还在下载，结束后才能再试"'), 'retrynote18');
  ok('W138 没有集名的失败行重画后仍放回已有链接', page.includes('let links=[];try{if(p.querySelectorAll)links=[...p.querySelectorAll("a")]}catch(_){}') && page.indexOf('let links=[];try{if(p.querySelectorAll)links=[...p.querySelectorAll("a")]}') < page.indexOf('b-st">✘ ${esc(shown)}</span>') && page.includes('links.forEach(el=>{try{p.appendChild(el)}catch(_){}})'), 'keepfail');
  ok('W139 成功行重画前先取出已有链接', page.includes('else{let links=[];try{if(p.querySelectorAll)links=[...p.querySelectorAll("a")]}catch(_){}p.innerHTML=`<span class="b-idx">${a+1}/${F0.length}</span><span class="b-ep" title="${esc(m)}">${esc(m)}</span><span class="b-st">✔ ${esc(q.mergeNote||"已保存")}') && page.includes('b-st">✔ 已保存</span>`;try{links.forEach(el=>{try{p.appendChild(el)}catch(_){}})'), 'keepok');
  ok('W140 重试时不是 blob 的链接也先放开', page.includes('if(!href)return;if(href.indexOf("blob:")===0)') && page.indexOf('if(!href)return;if(href.indexOf("blob:")===0)') < page.indexOf('el.textContent="这一集重试前已放开，若没保存成功请再下一次"'), 'noblob');
  ok('W141 文件名只有集名时重试也会放开', page.includes('p.querySelectorAll("a[href]")') && page.includes('name===String(m)||name.slice(-String(m).length-1)==="_"+m') && page.includes('nm===String(m)||nm.slice(-String(m).length-1)==="_"+m'), 'namematch');
  ok('W142 链接放开前两分钟先提醒保存', page.includes('if(el.getAttribute("href")===N&&String(el.textContent||"").indexOf("请先保存")<0)el.textContent=el.textContent+"（约两分钟后失效，请先保存）"') && page.includes('if(el.getAttribute("href")===V&&String(el.textContent||"").indexOf("请先保存")<0)el.textContent=el.textContent+"（约两分钟后失效，请先保存）"') && page.includes('},48e4);setTimeout') && page.includes('q.blobUrls.delete(N)},6e5)') && page.includes('q.blobUrls.delete(V)},6e5)'), 'warnsave');
  ok('W123 总状态已有字时也补上上次的说明', page.includes('((o.textContent||"").trim()?"；":" ")+note') && !page.includes('if(note){localStorage.removeItem("bilibili_helper_retry_note");if(o&&!o.textContent)'), 'retrynote4');
globalThis.performance = prevPerf14;
q.rel = null;
q.jsMergeMax = 1200 * 1024 * 1024;
saved.length = 0;
mode = 'small';
q.mergeNote = '';
q.mergeWhy = '';
const prevPerf = globalThis.performance;
globalThis.performance = { memory: { usedJSHeapSize: 80, jsHeapSizeLimit: 100 } };
arm = { seen: 0, saved: -1 };
let wireHeap = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 1 }, { url: 'video-url', size: 1 }], '018_课', mk()); } catch (e) { wireHeap = e; }
ok('W15 页面已较满时先保存再下另一份', wireHeap === null && merges === 0 && arm.saved === 1 && saved.length === 2 && q.mergeNote.includes('页面已经比较满'), `savedAtSecond=${arm.saved} ${q.mergeNote} ${wireHeap && wireHeap.message}`);
globalThis.performance = { memory: { usedJSHeapSize: 60, jsHeapSizeLimit: 100 } };
mode = 'small';
arm = { seen: 0, saved: -1 };
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireNext = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 1 }, { url: 'video-url', size: 20 }], '018b_课', mk()); } catch (e) { wireNext = e; }
ok('W20 下一份放下去会过满时先保存再下', wireNext === null && merges === 0 && arm.saved === 1 && saved.length === 2 && q.mergeNote.includes('页面已经比较满'), `savedAtSecond=${arm.saved} ${q.mergeNote} ${wireNext && wireNext.message}`);
globalThis.performance = { memory: { usedJSHeapSize: 60, jsHeapSizeLimit: 100 } };
mode = 'u8';
arm = null;
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireCopy = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 1 }], '018c_课', mk()); } catch (e) { wireCopy = e; }
ok('W21 合并前再留一份会过满时分开保存', wireCopy === null && merges === 0 && saved.length === 2 && q.mergeNote.includes('不再把两份放在一起'), `${q.mergeNote} ${wireCopy && wireCopy.message}`);
globalThis.performance = { memory: { usedJSHeapSize: 50, jsHeapSizeLimit: 100 } };
mode = 'u8';
delete q.noMerge;
arm = null;
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireOut = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 1 }], '022_课', mk()); } catch (e) { wireOut = e; }
ok('W33 报告了剩余空间但再留一份结果会过满时分开保存', wireOut === null && merges === 0 && saved.length === 2 && q.mergeNote.includes('不再把两份放在一起'), `${q.mergeNote} ${wireOut && wireOut.message}`);
globalThis.performance = { memory: { usedJSHeapSize: 55, jsHeapSizeLimit: 100 } };
mode = 'u8';
delete q.noMerge;
arm = { seen: 0, saved: -1 };
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireBefore = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 1 }, { url: 'video-url', size: 4 }], '023_课', mk()); } catch (e) { wireBefore = e; }
ok('W34 下另一份之前就把合并结果算进去', wireBefore === null && merges === 0 && arm.saved === 1 && saved.length === 2 && q.mergeNote.includes('先保存这一份再下另一份'), `savedAtSecond=${arm.saved} ${q.mergeNote} ${wireBefore && wireBefore.message}`);
globalThis.performance = { memory: { usedJSHeapSize: 40, jsHeapSizeLimit: 100 } };
mode = 'blob';
delete q.noMerge;
arm = null;
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
q.holdMax = 1024 * 1024 * 1024;
let wireBlob = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 6 }, { url: 'video-url', size: 1 }], '025块', mk()); } catch (e) { wireBlob = e; }
ok('W36 还不是字节块时按三份来留', wireBlob === null && merges === 0 && saved.length === 2 && q.mergeNote.includes('不再把两份放在一起'), `${q.mergeNote} ${wireBlob && wireBlob.message}`);
delete q.holdMax;
const quotaStore = { bilibili_helper_nomerge: JSON.stringify({ OLD: 1 }) };
const quotaSess = {};
globalThis.localStorage = { getItem: (k) => (k in quotaStore ? quotaStore[k] : null), setItem: (k, v) => { if (k === 'bilibili_helper_nomerge' && String(v).includes('OLD')) throw new Error('QuotaExceededError'); quotaStore[k] = String(v); }, removeItem: (k) => { delete quotaStore[k]; } };
globalThis.sessionStorage = { getItem: (k) => (k in quotaSess ? quotaSess[k] : null), setItem: (k, v) => { quotaSess[k] = String(v); }, removeItem: (k) => { delete quotaSess[k]; } };
globalThis.performance = {};
mode = 'alloc';
delete q.noMerge;
arm = null;
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireQuota = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '026额', mk()); } catch (e) { wireQuota = e; }
ok('W37 名单写不下时仍记住这一集', wireQuota === null && merges === 0 && saved.length === 2 && String(quotaStore.bilibili_helper_nomerge || '').includes('026额') && !String(quotaStore.bilibili_helper_nomerge || '').includes('OLD'), `${quotaStore.bilibili_helper_nomerge} ${q.mergeNote} ${wireQuota && wireQuota.message}`);
quotaSess.bilibili_helper_nomerge = JSON.stringify({ 甲: 1, 乙: 1, 丙: 1 });
globalThis.localStorage.setItem = (k, v) => { if (k === 'bilibili_helper_nomerge' && Object.keys(JSON.parse(v)).length > 3) throw new Error('QuotaExceededError'); quotaStore[k] = String(v); };
delete q.noMerge;
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireTrim = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '027留', mk()); } catch (e) { wireTrim = e; }
const keptTrim = String(quotaStore.bilibili_helper_nomerge || '');
ok('W38 写不下时只丢掉放不下的旧集', wireTrim === null && merges === 0 && keptTrim.includes('027留') && keptTrim.includes('乙') && !keptTrim.includes('甲'), `${keptTrim} ${wireTrim && wireTrim.message}`);
globalThis.localStorage.setItem = () => { throw new Error('QuotaExceededError'); };
globalThis.localStorage.removeItem = () => { throw new Error('QuotaExceededError'); };
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
cookieJar.clear();
delete q.noMerge;
mode = 'alloc';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireCookie = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '028记', mk()); } catch (e) { wireCookie = e; }
const cookieNote = String(pageDoc.cookie || '');
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'small';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireCookie2 = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '028记', mk()); } catch (e) { wireCookie2 = e; }
ok('W39 本地名单一个名字也写不下时记在页面里', wireCookie === null && wireCookie2 === null && merges === 0 && cookieNote.includes('bhnm=' + encodeURIComponent('028记')) && q.mergeNote.includes('上次在页面里放不下'), `${cookieNote} ${q.mergeNote} ${wireCookie2 && wireCookie2.message}`);
cookieJar.clear();
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'alloc';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireMany = null;
try {
  await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '030甲', mk());
  await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '030乙', mk());
} catch (e) { wireMany = e; }
const many = decodeURIComponent((String(pageDoc.cookie || '').match(/bhnm=([^;]*)/) || [])[1] || '');
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'small';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireMany2 = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '030甲', mk()); } catch (e) { wireMany2 = e; }
ok('W40 页面记录能留下不止一集', wireMany === null && wireMany2 === null && merges === 0 && many.includes('030甲') && many.includes('030乙') && q.mergeNote.includes('上次在页面里放不下'), `${many} ${q.mergeNote} ${wireMany2 && wireMany2.message}`);
cookieJar.clear();
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'alloc';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
const longName = (n) => ('031' + String(n).padStart(2, '0') + 'x'.repeat(80)).slice(0, 80);
let wireSpan = null;
try { for (let n = 0; n < 23; n++) await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], longName(n), mk()); } catch (e) { wireSpan = e; }
const allNotes = String(pageDoc.cookie).split('; ').filter((p) => /^bhnm\d*=/.test(p)).map((p) => decodeURIComponent(p.slice(p.indexOf('=') + 1))).join('\n');
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'small';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireSpan2 = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], longName(0), mk()); } catch (e) { wireSpan2 = e; }
ok('W41 一条页面记录写满后记到下一条', wireSpan === null && wireSpan2 === null && merges === 0 && String(pageDoc.cookie).includes('bhnm1=') && allNotes.includes(longName(0)) && allNotes.includes(longName(22)) && q.mergeNote.includes('上次在页面里放不下'), `cookies=${pageDoc.cookie.slice(0, 80)} ${q.mergeNote} ${wireSpan2 && wireSpan2.message}`);
const idbData = new Map();
globalThis.indexedDB = { open() { const req = {}; queueMicrotask(() => { const db = { _stores: new Set(), objectStoreNames: { contains: (name) => db._stores.has(name) }, createObjectStore(name) { db._stores.add(name); }, transaction(name) { if (!db._stores.has(name)) throw new Error('no store'); return { objectStore: () => ({ get(key) { const r = {}; queueMicrotask(() => { r.result = idbData.get(key); if (r.onsuccess) r.onsuccess(); }); return r; }, put(value, key) { idbData.set(key, value); const r = {}; queueMicrotask(() => { if (r.onsuccess) r.onsuccess(); }); return r; } }) }; }, close() {} }; req.result = db; if (req.onupgradeneeded) req.onupgradeneeded(); if (req.onsuccess) req.onsuccess(); }); return req; } };
cookieJar.clear();
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'alloc';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
const dbName = (n) => ('032' + String(n).padStart(3, '0') + 'y'.repeat(80)).slice(0, 80);
let wireDb = null;
try { for (let n = 0; n < 177; n++) await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], dbName(n), mk()); } catch (e) { wireDb = e; }
const dbList = idbData.get('list') || [];
cookieJar.clear();
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'small';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireDb2 = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], dbName(0), mk()); } catch (e) { wireDb2 = e; }
ok('W42 八条都满时仍记在浏览器数据库', wireDb === null && wireDb2 === null && merges === 0 && dbList.includes(dbName(0)) && dbList.includes(dbName(176)) && q.mergeNote.includes('上次在页面里放不下'), `db=${dbList.length} ${q.mergeNote} ${wireDb2 && wireDb2.message}`);
globalThis.indexedDB = { open() { const req = {}; queueMicrotask(() => { if (req.onerror) req.onerror(); }); return req; } };
cookieJar.clear();
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'alloc';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
const wideName = (n) => ('033' + String(n).padStart(3, '0') + 'z'.repeat(80)).slice(0, 80);
let wireWide = null;
try { for (let n = 0; n < 177; n++) await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], wideName(n), mk()); } catch (e) { wireWide = e; }
const wideNotes = String(pageDoc.cookie).split('; ').filter((p) => /^bhnm\d*=/.test(p)).map((p) => decodeURIComponent(p.slice(p.indexOf('=') + 1))).join('\n');
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'small';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireWide2 = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], wideName(0), mk()); } catch (e) { wireWide2 = e; }
ok('W43 数据库不可用时改记更多条', wireWide === null && wireWide2 === null && merges === 0 && wideNotes.includes(wideName(0)) && wideNotes.includes(wideName(176)) && q.mergeNote.includes('上次在页面里放不下'), `kept=${wideNotes.includes(wideName(0))} ${q.mergeNote} ${wireWide2 && wireWide2.message}`);
cookieJar.clear();
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'alloc';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
const markName = (n) => ('034' + String(n).padStart(3, '0') + 'm'.repeat(80)).slice(0, 80);
const markHash = (s) => { let h = 2166136261; s = String(s || ''); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };
let wireTiny = null;
try { for (let n = 0; n < 665; n++) await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], markName(n), mk()); } catch (e) { wireTiny = e; }
const markNotes = String(pageDoc.cookie).split('; ').filter((p) => /^bhnm\d*=/.test(p)).map((p) => decodeURIComponent(p.slice(p.indexOf('=') + 1))).join('\n');
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'small';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireTiny2 = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], markName(0), mk()); } catch (e) { wireTiny2 = e; }
ok('W44 三十条也满时收成短标记', wireTiny === null && wireTiny2 === null && merges === 0 && markNotes.includes('#' + markHash(markName(0))) && q.mergeNote.includes('上次在页面里放不下'), `${markNotes.includes('#' + markHash(markName(0)))} ${q.mergeNote} ${wireTiny2 && wireTiny2.message}`);
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
cookieJar.clear();
mode = 'die';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireDie = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '035早', mk()); } catch (e) { wireDie = e; }
const earlyNote = String(quotaSess.bilibili_helper_nomerge || '');
delete q.noMerge;
mode = 'u8';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireDie2 = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '035早', mk()); } catch (e) { wireDie2 = e; }
ok('W45 第一份还没下完就中断，重试仍分开保存', wireDie !== null && earlyNote.includes('035早') && wireDie2 === null && merges === 0 && q.mergeNote.includes('上次在页面里放不下'), `${earlyNote} ${q.mergeNote} ${wireDie && wireDie.message} ${wireDie2 && wireDie2.message}`);
q.keepNow = true;
const prevSessSet = globalThis.sessionStorage.setItem;
globalThis.sessionStorage.setItem = () => { throw new Error('session dead'); };
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
cookieJar.clear();
mode = 'die';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireFast = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '036急', mk()); } catch (e) { wireFast = e; }
const fastNote = String(pageDoc.cookie || '');
globalThis.sessionStorage.setItem = prevSessSet;
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'u8';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireFast2 = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '036急', mk()); } catch (e) { wireFast2 = e; }
ok('W46 名单还没写完也先记住这一集', wireFast !== null && fastNote.includes('bhnmnow=' + encodeURIComponent('036急')) && wireFast2 === null && merges === 0 && q.mergeNote.includes('上次在页面里放不下'), `${fastNote.slice(0, 80)} ${q.mergeNote} ${wireFast2 && wireFast2.message}`);
q.keepNow = false;
q.keepNow = true;
let hangReq = null;
let hangOpens = 0;
globalThis.indexedDB = { open() { const req = {}; hangOpens++; if (hangOpens === 1) hangReq = req; else queueMicrotask(() => { if (req.onerror) req.onerror(); }); return req; } };
cookieJar.clear();
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'die';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
const pendingHang = t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '037先', mk());
const midNote = String(pageDoc.cookie || '');
if (hangReq && hangReq.onerror) hangReq.onerror();
let wireHang = null;
try { await pendingHang; } catch (e) { wireHang = e; }
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'u8';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireHang2 = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '037先', mk()); } catch (e) { wireHang2 = e; }
ok('W47 数据库还没返回也已经记住', wireHang !== null && midNote.includes('bhnmnow=' + encodeURIComponent('037先')) && wireHang2 === null && merges === 0 && q.mergeNote.includes('上次在页面里放不下'), `${midNote.slice(0, 80)} ${q.mergeNote} ${wireHang2 && wireHang2.message}`);
q.keepNow = true;
const order = [];
const cookieDesc = Object.getOwnPropertyDescriptor(pageDoc, 'cookie');
Object.defineProperty(pageDoc, 'cookie', { configurable: true, get() { order.push('read'); return cookieDesc.get.call(pageDoc); }, set(value) { order.push('write'); return cookieDesc.set.call(pageDoc, value); } });
const prevGet = globalThis.sessionStorage.getItem;
globalThis.sessionStorage.getItem = () => { order.push('get'); throw new Error('session slow'); };
cookieJar.clear();
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'die';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireOrder = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '038先', mk()); } catch (e) { wireOrder = e; }
const wroteBefore = order.indexOf('write') >= 0 && order.indexOf('write') < order.indexOf('get');
const orderNote = cookieDesc.get.call(pageDoc);
Object.defineProperty(pageDoc, 'cookie', cookieDesc);
globalThis.sessionStorage.getItem = prevGet;
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'u8';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireOrder2 = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '038先', mk()); } catch (e) { wireOrder2 = e; }
ok('W48 翻名单之前就已经记住', wireOrder !== null && wroteBefore && String(orderNote).includes('bhnmnow=' + encodeURIComponent('038先')) && wireOrder2 === null && merges === 0 && q.mergeNote.includes('上次在页面里放不下'), `${order.join(',')} ${q.mergeNote} ${wireOrder2 && wireOrder2.message}`);
q.keepNow = false;
globalThis.performance = { memory: { usedJSHeapSize: 40, jsHeapSizeLimit: 100 } };
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'u6';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireTight = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 6 }, { url: 'video-url', size: 6 }], '039紧', mk()); } catch (e) { wireTight = e; }
ok('W49 两份字节块再留一份结果也分开保存', wireTight === null && merges === 0 && saved.length === 2 && q.mergeNote.includes('不再把两份放在一起'), `${q.mergeNote} ${saved.length} ${wireTight && wireTight.message}`);
q.keepNow = true;
cookieJar.clear();
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
globalThis.performance = { memory: { usedJSHeapSize: 1, jsHeapSizeLimit: 100 } };
mode = 'die';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
const cookieDesc2 = Object.getOwnPropertyDescriptor(pageDoc, 'cookie');
let cookieReads = 0;
Object.defineProperty(pageDoc, 'cookie', { configurable: true, get() { cookieReads++; if (cookieReads === 1) throw new Error('read died'); return cookieDesc2.get.call(pageDoc); }, set(value) { return cookieDesc2.set.call(pageDoc, value); } });
let wireRead = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '040冲', mk()); } catch (e) { wireRead = e; }
const stuck = [...cookieJar.keys()].some((k) => k.startsWith('bhx'));
Object.defineProperty(pageDoc, 'cookie', cookieDesc2);
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'u8';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireRead2 = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '040冲', mk()); } catch (e) { wireRead2 = e; }
ok('W50 上一条还没看完也已经写下', wireRead !== null && stuck && wireRead2 === null && merges === 0 && q.mergeNote.includes('上次在页面里放不下'), `stuck=${stuck} reads=${cookieReads} ${q.mergeNote} ${wireRead2 && wireRead2.message}`);
q.keepNow = false;
cookieJar.clear();
q.keepFull = true;
pageDoc.cookie = 'bhnmfull=1;path=/;max-age=2592000';
globalThis.performance = { memory: { usedJSHeapSize: 1, jsHeapSizeLimit: 100 } };
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'u8';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireFull = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '041满', mk()); } catch (e) { wireFull = e; }
ok('W51 名单已经满了就分开保存', wireFull === null && merges === 0 && saved.length === 2 && q.mergeNote.includes('记住的名单已经满了'), `${q.mergeNote} ${saved.length} ${wireFull && wireFull.message}`);
q.keepFull = false;
cookieJar.clear();
globalThis.performance = { memory: { usedJSHeapSize: 40, jsHeapSizeLimit: 100 } };
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'u4';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireFour = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 4 }, { url: 'video-url', size: 4 }], '042四', mk()); } catch (e) { wireFour = e; }
ok('W53 再留一份合成开销也分开保存', wireFour === null && merges === 0 && saved.length === 2 && q.mergeNote.includes('不再把两份放在一起'), `${q.mergeNote} ${saved.length} ${wireFour && wireFour.message}`);
cookieJar.clear();
let heapReads = 0;
globalThis.performance = { memory: { jsHeapSizeLimit: 100, get usedJSHeapSize() { heapReads++; return heapReads <= 3 ? 1 : 95; } } };
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'small';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireRoom = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '043成', mk()); } catch (e) { wireRoom = e; }
ok('W54 合成前页面又满了就分开保存', wireRoom === null && merges === 0 && saved.length === 2 && q.mergeNote.includes('合成结果放不下'), `reads=${heapReads} ${q.mergeNote} ${wireRoom && wireRoom.message}`);
cookieJar.clear();
globalThis.performance = {};
q.mergeHold = 8;
globalThis.q = q;
const blindMerge = qM(video, audio);
ok('W55 不报告剩余空间时结果太大也分开', blindMerge == null && qM.why === '浏览器没报告剩余空间，不再整份合成', qM.why || '');
delete q.mergeHold;
delete globalThis.q;
globalThis.performance = prevPerf;
const RealBlob = globalThis.Blob;
globalThis.Blob = function BoomBlob() { throw new Error('Invalid typed array length'); };
const boom = qM(video, audio);
globalThis.Blob = RealBlob;
ok('W56 做成文件失败也说页面放不下', boom == null && qM.why === '合并时页面放不下', qM.why || '');
cookieJar.clear();
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'small';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
const dirChunks = [];
q.dir = { getFileHandle: async () => ({ createWritable: async () => ({ write: async (p) => { dirChunks.push(p); }, close: async () => {} }) }) };
let wireDirMerge = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '044夹', mk()); } catch (e) { wireDirMerge = e; }
const dirHead = dirChunks[0] && dirChunks[0][4] === 102 && dirChunks[0][5] === 116 && dirChunks[0][6] === 121 && dirChunks[0][7] === 112;
ok('W57 选了文件夹就直接写入不再做整份', wireDirMerge === null && merges === 0 && saved.length === 0 && dirChunks.length > 1 && dirHead && q.dirNote === '已写入所选文件夹', `chunks=${dirChunks.length} saved=${saved.length} note=${q.dirNote} ${wireDirMerge && wireDirMerge.message}`);
q.dir = null;
q.dirNote = '';
const opfsChunks = [];
let blobNews = 0;
const BlobNow = globalThis.Blob;
globalThis.Blob = class extends BlobNow { constructor(...args) { super(...args); blobNews++; } };
const prevStorage = globalThis.navigator && globalThis.navigator.storage;
globalThis.navigator.storage = { getDirectory: async () => ({ getFileHandle: async () => ({ createWritable: async () => ({ write: async (p) => { opfsChunks.push(p); }, close: async () => {} }), getFile: async () => new BlobNow(opfsChunks, { type: 'video/mp4' }) }), removeEntry: async () => {} }) };
cookieJar.clear();
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'small';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireOpfs = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '045临', mk()); } catch (e) { wireOpfs = e; }
ok('W58 没选文件夹也先写入临时目录', wireOpfs === null && merges === 0 && saved.length === 1 && saved[0].includes('045临.mp4') && opfsChunks.length > 1 && blobNews === 0, `chunks=${opfsChunks.length} blobs=${blobNews} ${saved.join('|')} ${wireOpfs && wireOpfs.message}`);
globalThis.Blob = BlobNow;
if (prevStorage) globalThis.navigator.storage = prevStorage; else delete globalThis.navigator.storage;
const droppedAt = page.indexOf('audioU=null;await new Promise(r=>setTimeout(r,0));say("原件已放开，正在取回文件");jm=await fh.getFile()');
ok('W59 写完就放开两份原件', droppedAt > 0 && page.indexOf('if(i+1===cut){videoU=null') > 0 && page.indexOf('if(i+1===cut){videoU=null') < droppedAt && page.indexOf('a0(jm', droppedAt) > droppedAt, `at=${droppedAt}`);
const writeChunks = [];
globalThis.navigator.storage = { getDirectory: async () => ({ getFileHandle: async () => ({ createWritable: async () => ({ write: async (p) => { writeChunks.push(p); }, close: async () => {} }), getFile: async () => new Blob(writeChunks, { type: 'video/mp4' }) }), removeEntry: async () => {} }) };
cookieJar.clear();
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'small';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
const listWrite = mk();
let wireWrite = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '046写', listWrite); } catch (e) { wireWrite = e; }
const rowWrite = listWrite.children[1] && listWrite.children[1].children[0] && listWrite.children[1].children[0].textContent;
ok('W60 能写入时进度不再说页面会卡住', wireWrite === null && merges === 0 && String(rowWrite).includes('正在写入，不再整份放在页面里') && !String(rowWrite).includes('若页面卡住'), `${rowWrite} ${wireWrite && wireWrite.message}`);
delete globalThis.navigator.storage;
cookieJar.clear();
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'small';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
q.failSave = true;
let wireFailSave = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '047放', mk()); } catch (e) { wireFailSave = e; }
ok('W61 整份下载失败会提示重试分开保存', wireFailSave !== null && String(wireFailSave.message).includes('点重试会分开保存') && merges === 0 && saved.length === 0, `${wireFailSave && wireFailSave.message} saved=${saved.length}`);
q.failSave = false;
cookieJar.clear();
q.keepNow = true;
cookieJar.set('bhxold', '*');
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'small';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireStar = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '048星', mk()); } catch (e) { wireStar = e; }
ok('W62 上次还没写上名字就中断，这次分开保存', wireStar === null && merges === 0 && saved.length === 2 && q.mergeNote.includes('上次在页面里放不下'), `${q.mergeNote} ${saved.length} ${wireStar && wireStar.message}`);
q.keepNow = false;
cookieJar.clear();
const wide = (tag, n) => { const payload = new Uint8Array(n); payload.set(new TextEncoder().encode(tag)); const moov0 = box('moov', cat(mvhd(), trak(1, 0))); const off = ftyp().length + moov0.length + 8; return cat(ftyp(), box('moov', cat(mvhd(), trak(1, off))), box('mdat', payload)); };
globalThis.performance = {};
q.mergeHold = 96000;
globalThis.q = q;
const tighter = qM(wide('VIDE', 2000), wide('AUDI', 2000));
ok('W63 不报告剩余空间时十六分之一以上也分开', tighter == null && qM.why === '浏览器没报告剩余空间，不再整份合成', qM.why || '');
delete q.mergeHold;
const tinyBlind = qM(video, audio);
ok('W67 不报告剩余空间时也不再整份合成', tinyBlind == null && qM.why === '浏览器没报告剩余空间，不再整份合成', qM.why || '');
delete globalThis.q;
globalThis.performance = prevPerf;
const videoDrop = page.indexOf('videoU=null;await new Promise(r=>setTimeout(r,0))');
const audioDrop = page.indexOf('audioU=null;say("原件已放开，正在逐段做成文件', videoDrop);
const blobAt = page.indexOf('owned[i]=null;i++;if(i===cut)say("视频段已放开，正在送音频");c.enqueue(p)', audioDrop);
ok('W68 先放开原件再做成文件', page.includes('qM.deferBlob=!qM.wantParts') && videoDrop > 0 && audioDrop > videoDrop && blobAt > audioDrop && qM(video, audio) instanceof Blob, `v=${videoDrop} a=${audioDrop} b=${blobAt} ${qM.why || ''}`);
const copyNote = page.indexOf('正在挪开原件，若卡住请点重试，重试会分开保存');
ok('W69 复制和做成文件时说明进度', copyNote > 0 && copyNote < videoDrop && page.indexOf('原件已放开，正在逐段做成文件，若卡住请点重试，重试会分开保存', copyNote) > copyNote, `copy=${copyNote}`);
ok('W71 逐段做成文件并放开已写入的一段', page.includes('else jm=new Blob(owned,{type:"video/mp4"})') && blobAt > audioDrop, `blob=${blobAt}`);
ok('W74 逐段做成文件时显示段数并让出', page.indexOf('正在逐段做成文件 "+(i+1)+"/"+owned.length+"，若卡住请点重试，重试会分开保存', audioDrop) > audioDrop && page.indexOf('if(i&&i%8===0)await new Promise(r=>setTimeout(r,0))', audioDrop) > audioDrop, `yield=${page.indexOf('if(i&&i%8===0)')}`);
ok('W75 做成文件途中页面满了就停下', page.includes('m.usedJSHeapSize+n>m.jsHeapSizeLimit*0.7)stop()') && page.includes('if(oom)throw e') && page.includes('live=b=>!!(b&&(b.byteLength>0||b.size>0))') && page.includes('if(oom&&live(N)&&live(t))'), 'heap');
ok('W76 浏览器不报告内存时按已写字节停下', page.includes('cap=raw==null?8*1024*1024:raw/16;if(sent+n>cap)stop()') && page.includes('页面已经较满，这一段停下，点重试会分开保存') && page.includes('sent+=n;owned[i]=null'), 'sent');
ok('W77 文件夹写失败也不再一次复制成整块', page.includes('size:head.length+payLen,vCut:1+vMap.parts.length') && page.includes('return {parts:pieces,size:outN,vCut}') && page.includes('if(i===cut){videoU=null') && !page.includes('jm.parts.map(p=>p.slice?p.slice():new Uint8Array(p))'), 'opfs');
ok('W70 能挪走时不再复制一份', page.indexOf('p.buffer.transfer') > 0 && page.indexOf('p.buffer.transfer') < videoDrop, `transfer=${page.indexOf('p.buffer.transfer')}`);
ok('W64 还没准备数据库就先记下', page.includes('t0=async(e=!0,i,d,o,a,idIn)=>{let id=idIn||Math.random().toString(36).slice(2);try{document.cookie="bhx"+id+"="+encodeURIComponent("*")'), 'missing early marker');
const batchLoopAt = page.indexOf('for(let a=0;a<F0.length;a++){');
const batchMarkAt = page.indexOf('let bh=a?Math.random().toString(36).slice(2):bh0;try{document.cookie="bhx"+bh+"="+encodeURIComponent("*")', batchLoopAt);
const batchRelAt = page.indexOf('qRel()', batchMarkAt);
const armAt = page.indexOf('let held="",arm=ev=>{if(ev&&ev.button)return;if(bx0.running||q.bh0)return;try{document.cookie="bhnmpend="+encodeURIComponent("*")');
const downAt = page.indexOf('addEventListener("pointerdown",arm)', armAt);
const dxCall = page.indexOf('Dx(e)', downAt);
const bxCall = page.indexOf('let t=Bx()', dxCall);
const useAt = page.indexOf('let bh0=q.bh0||""');
const pickAt = page.indexOf('q.dir=await showDirectoryPicker', useAt);
ok('W65 调用之前就记下', page.split('catch(_){}try{document.cookie="bhnmpend=;path=/;max-age=0"}catch(_){}return id})()').length === 2 && page.includes(',_,bh)') && batchLoopAt >= 0 && batchMarkAt > batchLoopAt && batchRelAt > batchMarkAt && armAt > 0 && downAt > armAt && dxCall > downAt && bxCall > dxCall && useAt > 0 && pickAt > useAt, `arm=${armAt} down=${downAt} dx=${dxCall}`);
const notedAt = page.indexOf('已记下，若这次卡住，下次会分开保存', armAt);
ok('W72 找合集之前就说明下次会分开', notedAt > armAt && notedAt < downAt, `note=${notedAt}`);
const upAt = page.indexOf('addEventListener("pointerup",drop)', downAt);
const cancelAt = page.indexOf('addEventListener("pointercancel",drop)', upAt);
ok('W73 没点中就清掉这次标记', upAt > downAt && cancelAt > upAt && page.indexOf('q.bh0!==held)return;try{document.cookie="bhnmpend=;path=/;max-age=0"}catch(_){}try{document.cookie="bhx"+held+"=;path=/;max-age=0"}', armAt) > armAt && page.indexOf('held="";Dx(e)', cancelAt) > cancelAt, `up=${upAt} cancel=${cancelAt}`);
cookieJar.clear();
q.keepNow = true;
cookieJar.set('bhxold', '*');
for (const key of Object.keys(quotaSess)) delete quotaSess[key];
delete q.noMerge;
mode = 'small';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireOnce = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '049甲', mk()); } catch (e) { wireOnce = e; }
const starLeft = [...cookieJar.entries()].some(([, v]) => v === '*');
saved.length = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireAfter = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '049乙', mk()); } catch (e) { wireAfter = e; }
ok('W66 没写上名字只让下一集分开一次', wireOnce === null && q.mergeNote === '' && merges === 0 && saved.length === 1 && saved[0].includes('049乙') && !starLeft, `left=${starLeft} saved=${saved.join('|')} ${wireOnce && wireOnce.message} ${wireAfter && wireAfter.message}`);
q.keepNow = false;
cookieJar.clear();
delete globalThis.indexedDB;
delete globalThis.localStorage;
delete globalThis.sessionStorage;
globalThis.performance = prevPerf;
mode = 'alloc';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireAlloc = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '018d_课', mk()); } catch (e) { wireAlloc = e; }
ok('W22 合并时放不下就分开保存，不再往下走', wireAlloc === null && merges === 0 && saved.length === 2 && q.mergeNote.includes('合并时页面放不下'), `${q.mergeNote} ${wireAlloc && wireAlloc.message}`);
mode = 'alloc';
delete q.noMerge;
q.mergeWhy = '';
q.mergeNote = '';
saved.length = 0;
merges = 0;
let wireAgain = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '018e_课', mk()); } catch (e) { wireAgain = e; }
mode = 'small';
q.mergeWhy = '';
saved.length = 0;
merges = 0;
let wireSkip = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '018e_课', mk()); } catch (e) { wireSkip = e; }
ok('W23 同一集再次下载时不再把两份叠在一起', wireAgain === null && wireSkip === null && merges === 0 && saved.length === 2 && q.noMerge && q.noMerge['018e_课'] === 1 && q.mergeNote.includes('上次在页面里放不下'), `${q.mergeNote} ${wireSkip && wireSkip.message}`);
delete q.noMerge;
q.mergeWhy = '';
mode = 'small';
const memStore = {};
globalThis.sessionStorage = { getItem: (k) => (k in memStore ? memStore[k] : null), setItem: (k, v) => { memStore[k] = String(v); }, removeItem: (k) => { delete memStore[k]; } };
memStore.bilibili_helper_nomerge = JSON.stringify({ '018f_课': 1 });
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireKeep = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '018f_课', mk()); } catch (e) { wireKeep = e; }
ok('W24 刷新后仍记住这一集不再叠在一起', wireKeep === null && merges === 0 && saved.length === 2 && q.mergeNote.includes('上次在页面里放不下'), `${q.mergeNote} ${wireKeep && wireKeep.message}`);
delete globalThis.sessionStorage;
delete q.noMerge;
q.mergeWhy = '';
mode = 'small';
const keepStore = {};
globalThis.sessionStorage = { getItem: (k) => (k in keepStore ? keepStore[k] : null), setItem: (k, v) => { keepStore[k] = String(v); }, removeItem: (k) => { delete keepStore[k]; } };
globalThis.performance = {};
mode = 'alloc';
delete q.noMerge;
q.mergeWhy = '';
q.mergeNote = '';
saved.length = 0;
merges = 0;
let wireMark = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '018g_课', mk()); } catch (e) { wireMark = e; }
const kept = String(keepStore.bilibili_helper_nomerge || '').includes('018g_课');
mode = 'small';
globalThis.performance = { memory: { usedJSHeapSize: 1, jsHeapSizeLimit: 1024 * 1024 * 1024 } };
delete q.noMerge;
q.mergeWhy = '';
q.mergeNote = '';
saved.length = 0;
merges = 0;
let wireClear = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 1 }, { url: 'video-url', size: 1 }], '018h_课', mk()); } catch (e) { wireClear = e; }
const cleared = !String(keepStore.bilibili_helper_nomerge || '').includes('018h_课');
ok('W25 合并前先记住这一集，成功后忘掉', wireMark === null && wireClear === null && kept && cleared && merges === 0 && saved.length === 1 && saved[0].includes('018h_课.mp4'), `kept=${kept} cleared=${cleared} ${saved.join('|')} ${wireMark && wireMark.message} ${wireClear && wireClear.message}`);
delete globalThis.sessionStorage;
delete q.noMerge;
q.mergeWhy = '';
mode = 'small';
const idxStore = {};
globalThis.sessionStorage = { getItem: (k) => (k in idxStore ? idxStore[k] : null), setItem: (k, v) => { idxStore[k] = String(v); }, removeItem: (k) => { delete idxStore[k]; } };
idxStore.bilibili_helper_nomerge = JSON.stringify({ '005_课': 1 });
delete q.noMerge;
q.mergeWhy = '';
q.mergeNote = '';
saved.length = 0;
merges = 0;
let wireIdx = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '001_课', mk()); } catch (e) { wireIdx = e; }
ok('W28 重试换成另一个序号也还是分开保存', wireIdx === null && merges === 0 && saved.length === 2 && q.mergeNote.includes('上次在页面里放不下'), `${q.mergeNote} ${wireIdx && wireIdx.message}`);
delete globalThis.sessionStorage;
const earlyStore = {};
globalThis.sessionStorage = { getItem: (k) => (k in earlyStore ? earlyStore[k] : null), setItem: (k, v) => { earlyStore[k] = String(v); }, removeItem: (k) => { delete earlyStore[k]; } };
delete q.noMerge;
globalThis.performance = { memory: { usedJSHeapSize: 1, jsHeapSizeLimit: 1024 * 1024 * 1024 } };
q.watchMark = '019_课';
q.mergeWhy = '';
q.mergeNote = '';
mode = 'small';
arm = { seen: 0, saved: -1, marked: false };
saved.length = 0;
merges = 0;
let wireEarly = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 1 }, { url: 'video-url', size: 1 }], '019_课', mk()); } catch (e) { wireEarly = e; }
const earlyGone = !String(earlyStore.bilibili_helper_nomerge || '').includes('019_课');
ok('W29 下另一份之前就记住，合成成功后再忘掉', wireEarly === null && merges === 0 && arm.marked === true && earlyGone && saved.length === 1 && saved[0].includes('019_课.mp4'), `marked=${arm.marked} gone=${earlyGone} ${saved.join('|')} ${wireEarly && wireEarly.message}`);
delete q.watchMark;
delete globalThis.sessionStorage;
delete q.noMerge;
q.mergeWhy = '';
mode = 'small';
arm = null;
const longStore = {};
globalThis.localStorage = { getItem: (k) => (k in longStore ? longStore[k] : null), setItem: (k, v) => { longStore[k] = String(v); }, removeItem: (k) => { delete longStore[k]; } };
longStore.bilibili_helper_nomerge = JSON.stringify({ '020_课': 1 });
delete q.noMerge;
q.mergeWhy = '';
q.mergeNote = '';
mode = 'small';
saved.length = 0;
merges = 0;
let wireLong = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '020_课', mk()); } catch (e) { wireLong = e; }
ok('W31 关掉标签页后仍分开保存', wireLong === null && merges === 0 && saved.length === 2 && q.mergeNote.includes('上次在页面里放不下'), `${q.mergeNote} ${wireLong && wireLong.message}`);
delete globalThis.localStorage;
delete q.noMerge;
q.mergeWhy = '';
mode = 'small';
saved.length = 0;
mode = 'blind';
q.holdMax = 3;
q.mergeNote = '';
q.mergeWhy = '';
globalThis.performance = {};
arm = { seen: 0, saved: -1 };
let wireBlind = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 4 }, { url: 'video-url', size: 4 }], '019_课', mk()); } catch (e) { wireBlind = e; }
ok('W17 不报告剩余空间且这一份已经较大时先保存', wireBlind === null && merges === 0 && arm.saved === 1 && saved.length === 2 && q.mergeNote.includes('不报告剩余空间'), `savedAtSecond=${arm.saved} ${q.mergeNote} ${wireBlind && wireBlind.message}`);
mode = 'blind2';
q.holdMax = 5;
arm = null;
saved.length = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireBlind2 = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 2 }, { url: 'video-url', size: 0 }], '020_课', mk()); } catch (e) { wireBlind2 = e; }
ok('W18 不报告剩余空间且两份加起来已经较大时分开保存', wireBlind2 === null && merges === 0 && saved.length === 2 && q.mergeNote.includes('两份加起来已经较大'), `${q.mergeNote} ${saved.join('|')} ${wireBlind2 && wireBlind2.message}`);
mode = 'blind2';
q.holdMax = 5;
delete q.noMerge;
arm = { seen: 0, saved: -1 };
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireBlind3 = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 2 }, { url: 'video-url', size: 2 }], '024结果', mk()); } catch (e) { wireBlind3 = e; }
ok('W35 不报告剩余空间时下另一份之前就给合并结果留位置', wireBlind3 === null && merges === 0 && arm.saved === 1 && saved.length === 2 && q.mergeNote.includes('再留一份合并结果会放不下'), `savedAtSecond=${arm.saved} ${q.mergeNote} ${wireBlind3 && wireBlind3.message}`);
mode = 'u8';
q.holdMax = 20;
delete q.noMerge;
arm = null;
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
let wireTwice = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 1 }], '021_课', mk()); } catch (e) { wireTwice = e; }
ok('W32 再留一份合并结果也会放不下时分开保存', wireTwice === null && merges === 0 && saved.length === 2 && q.mergeNote.includes('两份加起来已经较大'), `${q.mergeNote} ${wireTwice && wireTwice.message}`);
delete q.holdMax;
globalThis.performance = prevPerf;
mode = 'small';
arm = null;
saved.length = 0;
mode = 'needdir';
q.dir = null;
q.mergeNote = '';
q.mergeWhy = '';
let picks = 0;
globalThis.showDirectoryPicker = async () => { picks++; q.dir = { getFileHandle: async () => ({ createWritable: async () => ({ write: async () => {}, seek: async () => {}, truncate: async () => {}, close: async () => {} }) }) }; return q.dir; };
const listDir = mk();
let wireDir = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 4 }, { url: 'video-url', size: 4 }], '021_课', listDir); } catch (e) { wireDir = e; }
const rowDir = listDir.children[0] && listDir.children[0].children[0] && listDir.children[0].children[0].textContent;
ok('W19 合集里这一份太大时先选文件夹再下一次', wireDir === null && picks === 1 && merges === 0 && String(rowDir).includes('已边下边写入文件夹'), `picks=${picks} ${rowDir} ${wireDir && wireDir.message}`);
delete globalThis.showDirectoryPicker;
q.dir = null;
mode = 'small';
{
  const a = page.indexOf('bxShown=e=>');
  const b = page.indexOf('}};', a);
  const bxShown = new Function(page.slice(a, b + 3) + '\nreturn bxShown;')();
  const folder = bxShown({ message: '这一份页面里留不住一整块，请先选择文件夹再重试' });
  const wasm = bxShown(new Error('RuntimeError: memory access out of bounds'));
  const plain = bxShown(new Error('下载请求失败(403)'));
  const lost = bxShown(new Error('这一集太大，页面里留不住'));
  const dead = bxShown(Object.assign(new Error('The request is not allowed'), { name: 'NotAllowedError' }));
  ok('W16 要选文件夹时不再说成ffmpeg失败', folder.oom === true && folder.shown.includes('点重试会先请你选择文件夹') && wasm.shown.includes('不再进 ffmpeg') && plain.shown === '下载请求失败(403)' && lost.shown.includes('重新下载') && !lost.shown.includes('不再进 ffmpeg') && dead.shown === '文件夹权限失效，点重试会重新选择', `${folder.shown} | ${wasm.shown} | ${lost.shown} | ${dead.shown}`);
  const alloc = bxShown(new Error('Array buffer allocation failed'));
  ok('W26 分配失败也说成分开保存，不再显示英文', alloc.oom === true && alloc.shown.includes('不再进 ffmpeg') && !alloc.shown.includes('allocation'), alloc.shown);
  const full = bxShown(new Error('合并时页面放不下，点重试会分开保存'));
  ok('W78 页面放不下的失败重试会直接分开', full.oom === true && full.shown.includes('不再进 ffmpeg') && !full.shown.includes('合并时页面放不下'), full.shown);
  const kept = bxShown(new Error('只留下了音频，点重试会再下一次'));
  ok('W85 只剩一份时先保存再重试', kept.oom === true && kept.shown === '只留下了音频，点重试会再下一次' && page.includes('if(videoU)t=videoU;if(audioU)N=audioU') && page.includes('throw new Error("只留下了"+which+"，点重试会再下一次")') && page.includes("p.querySelector('a[download]')"), kept.shown);
  ok('W86 做成文件停在视频段时留下音频', page.includes('made=i') && page.includes('if(oom&&owned){let rest=[];if(made<=cut)') && page.includes('a0(new Blob(rest,{type:"audio/mp4"}),o+"_音频.m4a",a)'), 'tail');
  ok('W87 停在音频第一段时这段还没送出', page.includes('if(made<=cut)') && !page.includes('if(oom&&made<cut)'), 'edge');
  ok('W88 已经送出的音频段还能拼回来', page.includes('if(i>=cut)kept.push(p)') && page.includes('for(let k=0;k<kept.length;k++)if(kept[k])rest.push(kept[k])') && page.includes('}).blob();kept=null'), 'kept');
  ok('W89 视频段不再留一份引用', page.includes('if(i>=cut)kept.push(p)') && page.includes('if(i===cut)say("视频段已放开，正在送音频")') && page.indexOf('kept.push(p)') === page.indexOf('if(i>=cut)kept.push(p)') + 'if(i>=cut)'.length, 'novid');
  ok('W90 单独保存前先说明', page.includes('say("这一份没做成，正在把音频单独保存")') && page.includes('say("这一份没做成，正在把"+which+"单独保存")'), 'saysave');
  ok('W91 失败行盖掉后仍能放回下载链接', page.includes('q.mergeSaves=[...a.querySelectorAll("a[download]")]') && page.includes('bx0.failLog.push(`${a+1}. ${h.title} — ${shown}`)') && page.includes('textContent="保存 "+s.name,el.style.marginLeft="8px",p.appendChild(el)})}catch(_){}}}q.mergeSaves=null'), 'relink');
  ok('W92 合成成功后这一行重画仍留着下载', page.includes('await a0(jm,o+".mp4",a);try{q.mergeSaves=') && page.includes('await a0(c,o+".mp4",a);try{q.mergeSaves='), 'oklink');
  ok('W93 链接失效前会多留一会儿并说明', page.includes('q.blobUrls.delete(N)},6e5)') && page.includes('el.textContent="（链接已失效，若没保存成功请再下一次）"') && !page.includes('q.blobUrls.delete(N)},6e4)'), 'ttl');
ok('W79 单集失败会重新打开按钮并说明再点一次分开', page.includes('let _=null,K=g.getAttribute("title"),fail=err=>{m()') && page.split('.then(()=>{q.saveAs="";m()},err=>{q.saveAs="";fail(err)})').length === 3 && page.includes('合并内存不足，再点一次会分开保存，不再进 ffmpeg'), 'single');
ok('W80 写入文件夹时写完视频就放开', page.includes('正在写入文件夹 "+(i+1)+"/"+jm.parts.length') && page.includes('正在写入浏览器文件夹 "+(i+1)+"/"+jm.parts.length') && page.includes('jm.parts[i]=null;if(i+1===cut){videoU=null') && page.includes('audioU=null;await new Promise(r=>setTimeout(r,0));say("原件已放开，正在取回文件");jm=await fh.getFile()'), 'dir');
ok('W81 合集进度也写到总状态', page.includes('let say=t=>{try{if(a){let ep=a.querySelector&&a.querySelector(".b-ep")') && page.includes('else a.innerHTML=t') && page.includes('st.textContent=" "+t') && page.includes('bx0.lastStatus=st.textContent'), 'say');
  ok('W94 合集进度不再盖掉这一集的名字', page.includes('a.querySelector(".b-st")') && page.includes('line.textContent=" "+t') && page.includes('a.querySelector(".b-ep")') && !page.includes('line.className="b-say"'), 'keepname');
  ok('W95 失败时改掉原来的状态不再另起一行', page.includes('let st=p.querySelector(".b-st");if(!st){st=document.createElement("span");st.className="b-st";p.appendChild(st)}st.textContent="✘ "+shown'), 'onestatus');
  ok('W96 收尾时不再整行重画', page.includes('st.textContent="✔ "+(q.mergeNote||"已保存")') && page.includes('if(!p.querySelector("a[download]"))(q.mergeSaves') && page.includes('st.textContent="✘ "+shown;if(!p.querySelector("a[download]"))'), 'inplace');
  ok('W97 下一集开始前放开的链接会说明', page.includes('el.textContent="链接已放开，若没保存成功请再下一次"') && page.includes('q.blobUrls.delete(V)},6e5)') && !page.includes('q.blobUrls.delete(V)},6e4)') && !page.includes('已交给浏览器，链接已释放'), 'relnote');
  {
    const relAt = page.indexOf('qRel=()=>');
    const rel = page.slice(relAt, page.indexOf('return n}', relAt) + 'return n}'.length);
    ok('W98 放开上一集链接时改掉那一行', rel.includes('document.querySelectorAll("a[download]")') && rel.indexOf('querySelectorAll("a[download]")') < rel.indexOf('URL.revokeObjectURL(V)'), 'relrow');
  }
ok('W82 取回文件前先放开音频', page.includes('原件已放开，正在取回文件') && page.indexOf('jm=await fh.getFile()') > page.indexOf('audioU=null;await new Promise(r=>setTimeout(r,0));say("原件已放开，正在取回文件")'), 'getfile');
cookieJar.clear();
delete q.noMerge;
mode = 'small';
saved.length = 0;
merges = 0;
q.mergeNote = '';
q.mergeWhy = '';
cookieJar.set('bhnmpend', '*');
let wirePend = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 8 }, { url: 'video-url', size: 8 }], '049笔', mk()); } catch (e) { wirePend = e; }
const pendSaved = saved.length, pendNote = q.mergeNote, pendLeft = cookieJar.has('bhnmpend');
saved.length = 0;
merges = 0;
q.mergeNote = '';
cookieJar.clear();
delete q.noMerge;
ok('W83 按下的第一句就先记一笔', page.includes('bhnmpend="+encodeURIComponent("*")') && page.includes('bhnmpend=;path=/;max-age=0') && page.includes('(?:^|; )bhnmpend=\\*') && page.indexOf('bhnmpend="+encodeURIComponent("*")') < page.indexOf('bhx"+bh0+"="+encodeURIComponent("*")') && wirePend === null && pendSaved === 2 && !pendLeft && pendNote.includes('上次在页面里放不下'), `${pendNote} ${pendSaved} ${pendLeft} ${wirePend && wirePend.message}`);
ok('W84 单集一点击就先记一笔', page.includes('contains("disabled"))return;try{document.cookie="bhnmpend="+encodeURIComponent("*")') && page.includes('(()=>{try{document.cookie="bhnmpend=;path=/;max-age=0"}catch(_){}})(),R('), 'singlepend');
}
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
saved.length = 0;
mode = 'bad';
q.noWasm = false;
q.mergeNote = '';
q.mergeWhy = '';
const st5 = mk();
let wire5 = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 1 }, { url: 'video-url', size: 1 }], '010_课', st5); } catch (e) { wire5 = e; }
ok('W5 合并不了时结果里写明原因且不进ffmpeg', wire5 === null && merges === 0 && saved.length === 2 && q.mergeNote.includes('结构未识别') && st5.innerHTML.includes('结构未识别'), `note=${q.mergeNote} html=${st5.innerHTML} ${wire5 && wire5.message}`);
saved.length = 0;
merges = 0;
mode = 'bad';
q.useWasm = true;
q.memBoom = 'RuntimeError: memory access out of bounds';
q.mergeNote = '';
q.mergeWhy = '';
delete q.noMerge;
let wireMem = null;
try { await t0(true, { classList: { add() {}, remove() {} } }, [{ url: 'audio-url', size: 1 }, { url: 'video-url', size: 1 }], '010b_课', mk()); } catch (e) { wireMem = e; }
ok('W27 合并器报内存错误时分开保存且不再带英文', wireMem === null && saved.length === 2 && q.mergeNote.includes('合并内存不足') && !q.mergeNote.includes('RuntimeError'), `${q.mergeNote} ${wireMem && wireMem.message}`);
q.useWasm = false;
q.memBoom = '';
delete q.noMerge;

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

const ai = page.indexOf('a0=(');
const aj = page.indexOf(',o0=async', ai);
globalThis.window = globalThis;
const clicks = [];
const fakeURL = { createObjectURL: () => 'blob:test', revokeObjectURL: () => {} };
class FakeMouse {}
const fakeDoc = {
  createElement: () => {
    const n = { children: [], attrs: {}, textContent: '', innerHTML: '' };
    n.setAttribute = (k, v) => { n.attrs[k] = v; };
    n.appendChild = (c) => { n.children.push(c); return c; };
    n.dispatchEvent = () => { clicks.push(n.attrs.download); };
    return n;
  },
};
const saveQ = { blobUrls: new Set(), dir: null, dirNote: '' };
const saveFn = new Function('q', 'q0', 'document', 'URL', 'Blob', 'MouseEvent', page.slice(ai, aj) + '\nreturn a0;')(saveQ, (u) => saveQ.blobUrls.add(u), fakeDoc, fakeURL, Blob, FakeMouse);
const writes = [];
saveQ.dir = {
  getFileHandle: async (name, opt) => ({
    createWritable: async () => ({
      write: async (b) => { writes.push(name + ':' + (b.size || b.byteLength) + ':' + opt.create + ':' + (b instanceof Blob ? 'blob' : 'raw')); },
      close: async () => {},
    }),
  }),
};
const box1 = fakeDoc.createElement();
await saveFn(new Uint8Array([1, 2, 3, 4]), 'v.mp4', box1);
ok('S1 选了文件夹就写入且不再弹第二个下载', writes.join('|') === 'v.mp4:4:true:raw' && clicks.length === 0 && saveQ.dirNote === '已写入所选文件夹' && box1.children.length === 1, writes.join('|'));
saveQ.dir = { getFileHandle: async () => { throw new Error('no dir'); } };
saveQ.dirNote = '';
const box2 = fakeDoc.createElement();
await saveFn(new Uint8Array([9]), 'a.m4a', box2);
ok('S2 文件夹写入失败就退回点击保存', saveQ.dir === null && clicks[0] === 'a.m4a' && box2.children.some((c) => c.attrs && c.attrs.download === 'a.m4a'), `clicks=${clicks.join('|')} dir=${saveQ.dir}`);

console.log(fail.length ? `SIM-FAIL n=${fail.length}: ${fail.join(' | ')}` : 'ALL SIM CHECKS PASS');
process.exit(fail.length ? 1 : 0);
