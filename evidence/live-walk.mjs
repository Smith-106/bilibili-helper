// live-walk.mjs — 运行已提交源码中的真实U1逐页抓取(up主396395171全量列表):
//   node evidence/live-walk.mjs  →  落盘 evidence/live-walk-full.jsonl(逐页) + evidence/live-walk-full-summary.json
// 零伪造: 直接从 bilibili-helper-content-script.js 提取 `var U1=` 当行源码求值运行,
// pacing/退避/上限/去重/冷却全部走已提交U1逻辑; 仅在node侧垫 browser UA/Referer 头与
// localStorage内存垫片(浏览器中由环境原生提供)。单次顺序 walk, 风控码即按U1既有语义处理。
import fs from 'node:fs';

const H = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  'Referer': 'https://www.bilibili.com/',
  'Origin': 'https://www.bilibili.com'
};
const MID = 396395171;
const T0 = Date.now();
const ts = () => new Date().toISOString();

const src = fs.readFileSync('bilibili-helper-content-script.js', 'utf8');
const lines = src.split('\n');
console.log('SRC_TOTAL=' + lines.length);
lines.forEach((l, i) => { if (l.includes('var U1=')) console.log('SRC_U1_IDX=' + (i + 1)); });
const u1line = lines.find((l) => l.includes('var U1='));
if (!u1line) { console.log('WALK-FAIL U1 line missing'); process.exit(1); }

const store = new Map();
const localStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => { store.set(k, String(v)); },
  removeItem: (k) => { store.delete(k); }
};
const bx0 = { cancel: false };
const bx2 = (ms) => new Promise((r) => setTimeout(r, ms));
const V = { credentials: 'include' };
const E = { OK: 0 };

const pages = [];
let fetchCalls = 0, backoff799 = 0;
const winFetch = async (url, opts) => {
  fetchCalls++;
  const urlStr = String(url).startsWith('//') ? 'https:' + String(url) : String(url);
  const m = urlStr.match(/[?&]pn=(\d+)/);
  const pn = m ? +m[1] : 1;
  const t = Date.now();
  let code = 'THREW', vlen = 0, first = '', last = '', http = 0;
  try {
    const r = await fetch(urlStr, { ...(opts || {}), headers: H });
    http = r.status;
    const tx = await r.text();
    try {
      const j = JSON.parse(tx);
      code = j.code;
      const vl = (j.data && j.data.list && j.data.list.vlist) || [];
      vlen = vl.length;
      first = (vl[0] || {}).bvid || '';
      last = (vl[vl.length - 1] || {}).bvid || '';
      if (code === -799) backoff799++;
    } catch (_) { code = 'HTML_' + http; }
    pages.push({ pn, code, http, vlen, first, last, ms: Date.now() - t });
    console.log(`PAGE pn=${pn} code=${code} http=${http} vlen=${vlen} first=${first} last=${last}`);
    const body = tx;
    return { json: async () => JSON.parse(body) };
  } catch (e) {
    pages.push({ pn, code: 'THREW', err: String((e && e.message) || e), ms: Date.now() - t });
    console.log(`PAGE pn=${pn} THREW ${e.message}`);
    throw e;
  }
};

const factory = new Function('bx0', 'bx2', 'V', 'E', 'window', 'localStorage', 'esc', u1line + '; return U1;');
const U1 = factory(bx0, bx2, V, E, { fetch: winFetch }, localStorage, String);
const notify = (s) => console.log('U1-NOTIFY ' + s);

let res = null, threw = null;
try {
  res = await U1(MID, notify);
} catch (e) { threw = String((e && e.message) || e); }

const got = res ? res.length : -1;
const uniq = res ? new Set(res.map((x) => x.bvid)).size : -1;
const summary = {
  generated_at: ts(),
  mid: MID,
  src_u1_idx: lines.findIndex((l) => l.includes('var U1=')) + 1,
  elapsed_ms: Date.now() - T0,
  fetchCalls,
  backoff799_used: backoff799 > 0,
  got,
  uniq,
  total_count: res ? (res.expected === 0 ? 0 : res.expected) : -1,
  partial: res ? !!res.partial : null,
  cached: res ? !!res.cached : null,
  cool: res ? !!res.cool : null,
  cacheTs: res ? (res.cacheTs || 0) : 0,
  threw,
  first: (res && res[0] && res[0].bvid) || '',
  last: (res && res[res.length - 1] && res[res.length - 1].bvid) || '',
  converged: got > 0 && uniq === got && res && res.expected > 0 && got >= res.expected && !res.partial,
  pages
};
fs.writeFileSync('evidence/live-walk-full.jsonl', pages.map((p) => JSON.stringify(p)).join('\n') + '\n');
fs.writeFileSync('evidence/live-walk-full-summary.json', JSON.stringify(summary, null, 1));
console.log('WALK-SUMMARY ' + JSON.stringify({ got, uniq, expected: summary.total_count, partial: summary.partial, cool: summary.cool, threw, fetchCalls, converged: summary.converged }));
