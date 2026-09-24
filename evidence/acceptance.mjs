// Acceptance gate for goal 23ac5a14: fast, deterministic, no network.
// Verifies R1 legs (view/pagelist/playurl/byte 1158/1158), R2 (pn1/top code0, static zero), R3 (risk 0 on sweep legs).
// Exit 0 = all gates pass; non-zero = fail. Prints concrete numbers for verifier log.
import fs from 'node:fs';
const fail = (m) => { console.log('ACCEPT-FAIL ' + m); process.exit(1); };
const ok = (m) => console.log('ACCEPT-OK ' + m);
const J = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

// R2 static zero (scheme file)
const src = fs.readFileSync('bilibili-helper-content-script.js', 'utf8');
const wbi = (src.match(/wbi|mixin/gi) || []).length;
if (wbi !== 0) fail('wbi|mixin=' + wbi);
ok('static wbi|mixin=0');
if (src.includes('-403')) fail('-403 literal present');
ok('static -403=0');
if (src.includes('-401')) fail('-401 literal present');
ok('static -401=0');
if (src.includes('访问权限不足')) fail('deny literal present');
ok('static deny=0');

// R2 pn1 + top raw files
const pn1 = J('evidence/live-walk-pn1.json');
const pn1vlen = ((pn1.data && pn1.data.list && pn1.data.list.vlist) || []).length;
const pn1count = pn1.data && pn1.data.page && pn1.data.page.count;
const pn1first = (((pn1.data && pn1.data.list && pn1.data.list.vlist) || [])[0] || {}).bvid;
if (pn1.code !== 0 || pn1count !== 1159 || pn1vlen !== 30) fail(`pn1 code=${pn1.code} count=${pn1count} vlen=${pn1vlen}`);
ok(`pn1 code=0 count=1159 vlen=30 first=${pn1first}`);
const top = J('evidence/live-top-arc.json');
if (top.code !== 0) fail('top code=' + top.code);
ok(`top code=0 aid=${top.data && top.data.aid} bvid=${(top.data || {}).bvid || ''}`);

// R1 summary files
const va = J('evidence/verify-ascii.json');
if (va.view.code0 !== 1158 || va.chain.both !== 1158 || va.playurl.dl !== 1158) fail('verify-ascii ' + JSON.stringify(va));
ok('verify-ascii view1158 chain1158 playurl1158');
const bs = J('evidence/live-full-byte-summary.json');
if (bs.ok !== 1158 || bs.risk_hits !== 0 || bs.idx_complete !== true) fail('byte-summary ' + JSON.stringify({ ok: bs.ok, risk: bs.risk_hits }));
ok(`byte-summary ok=1158/1158 dash=${bs.dash_n} durl1=${bs.durl1_n} risk=0`);
const vs = J('evidence/live-full-view-summary.json');
if (vs.view_code0 !== 1158 || vs.risk_hits !== 0) fail('view-summary');
ok('view-summary 1158/1158 risk0');
const cs = J('evidence/live-full-chain-summary.json');
if (cs.chain_ok !== 1158 || cs.risk_hits !== 0) fail('chain-summary');
ok('chain-summary 1158/1158 risk0');
const ps = J('evidence/live-full-playurl-summary.json');
if (ps.playurl_code0_dl !== 1158 || ps.risk_hits !== 0) fail('playurl-summary');
ok('playurl-summary 1158/1158 risk0');

// R1 progress files recount (bounded, no full dump)
const cnt = (p) => fs.readFileSync(p, 'utf8').trim().split('\n').filter(Boolean).length;
const RISK = new Set([-799, -352, -403, -401, 412, 'HTML', 'THROW']);
const JL = (p) => fs.readFileSync(p, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
const v = JL('evidence/full-view-progress.jsonl');
if (v.length !== 1158 || v.filter((r) => r.code === 0).length !== 1158 || v.filter((r) => RISK.has(r.code)).length !== 0) fail('view-progress');
ok('view-progress 1158/1158 risk0');
const praw = JL('evidence/full-pagelist-progress.jsonl');
const pm = new Map();
for (const r of praw) { const c = pm.get(r.i); if (!c || r.code === 0) pm.set(r.i, r); }
const pd = [...pm.values()];
if (pd.length !== 1158 || pd.filter((r) => r.code === 0 && r.cid).length !== 1158) fail('pagelist-progress');
ok(`pagelist-progress dedup1158/1158 raw=${praw.length}`);
const u = JL('evidence/full-playurl-progress.jsonl');
if (u.length !== 1158 || u.filter((r) => r.dl === true).length !== 1158) fail('playurl-progress');
ok('playurl-progress 1158/1158 dl');
const b = JL('evidence/full-byte-progress.jsonl');
const bm = new Map();
for (const r of b) { const c = bm.get(r.i); if (!c || r.ok) bm.set(r.i, r); }
const bd = [...bm.values()];
if (bd.length !== 1158 || bd.filter((r) => r.ok).length !== 1158) fail('byte-progress');
ok(`byte-progress dedup1158/1158 raw=${b.length}`);

// R3 inventory separation (quota-leg honest records, sweep legs zero)
const inv = J('evidence/live-code-inventory.json');
if (inv.codes['-799'].count !== 1 || inv.codes['HTML_412'].count !== 2) fail('inventory quota-leg');
if (inv.codes['0'].count < 4000) fail('inventory code0');
ok(`inventory code0=${inv.codes['0'].count} 206=${inv.codes['HTTP_206'].count} -799x1 412x2 transientx${inv.codes['TRANSIENT_THROW_RETRIED_OK'].count}`);

console.log('ALL-ACCEPTANCE-PASS');
