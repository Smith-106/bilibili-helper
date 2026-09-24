// verify-u1-bxd.mjs — U1+bxD 独立验证 harness(零网络, 可被 verifier 直接复跑):
//   node evidence/verify-u1-bxd.mjs  →  落盘 evidence/verify-report.json
// 覆盖:
//   A) 静态: U1走legacy零签名 / 全仓无wbi死代码 / U1无throw无登录无-403/-401 / fetch预算2 / 间隔与退避与上限与去重
//   B) 重放: 当前U1源码 + evidence/up-list-pn1.json 真实30条逐字节(p1) + 确定性派生p2-p39 → 39页收敛
//   C) 预算场景: 中途-352 / 首屏-403+top兜底 / 首屏网络异常+兜底空 → 全部无抛错、partial降级、fetch有界
//   D) 链路: bxD速度控制(pagelist/persist/delay/jitter/失败冷却/跳过) + legacy playurl基址
import fs from 'node:fs';

const fail = [];
const ok = (name, cond, extra = '') => {
  console.log((cond ? '✓ ' : '✗ ') + name + (extra ? ' | ' + extra : ''));
  if (!cond) fail.push(name);
};

const src = fs.readFileSync('bilibili-helper-content-script.js', 'utf8');
const lines = src.split('\n');
const u1line = lines.find(l => l.includes('var U1='));
if (!u1line) { console.log('✗ U1 line missing'); process.exit(1); }
const ui = src.indexOf('var U1=');
const uj = src.indexOf('o.partial=q;return o};') + 20;
const u1 = src.slice(ui, uj);

// ---- A) 静态 ----
const cnt = (re) => (src.match(re) || []).length;
ok('A1 U1走legacy arc/search', u1.includes('x/space/arc/search?mid='));
ok('A2 U1零wbi', !/wbi/i.test(u1));
ok('A3 U1零w_rid', !u1.includes('w_rid'));
ok('A4 U1零bW调用', !u1.includes('bW('));
ok('A5 U1零throw(无抛错分支)', !u1.includes('throw'));
ok('A6 U1零登录语义', !u1.includes('登录'));
ok('A7 全仓-403清零', cnt(/-403/g) === 0, 'count=' + cnt(/-403/g));
ok('A8 全仓-401清零', cnt(/-401/g) === 0, 'count=' + cnt(/-401/g));
ok('A9 全仓访问权限不足清零', cnt(/访问权限不足/g) === 0);
ok('A10 全仓wbi清零', cnt(/wbi/g) === 0);
ok('A11 全仓MIXIN/bWk/bM5/bDm/bRk清零',
  cnt(/MIXIN/g) === 0 && cnt(/\bbWk\b/g) === 0 && cnt(/\bbM5\b/g) === 0 && cnt(/\bbDm\b/g) === 0 && cnt(/\bbRk\b/g) === 0);
ok('A12 U1 fetch引用=1(仅主分页, top兜底已移除)', (u1.match(/window\.fetch/g) || []).length === 1);
ok('A13 页间隔1500-2300ms', u1.includes('bx2(1500+Math.floor(Math.random()*800))'));
ok('A14 -799/网络异常有界递增退避(rt计数,≤4次,12-27s)', u1.includes('(c===-799||!u)&&rt<4') && u1.includes('bx2(8000+rt*4000+Math.floor(Math.random()*3000))'));
ok('A15 t>=40上限', u1.includes('t>=40'));
ok('A16 seen去重', u1.includes('seen=new Set') && u1.includes('seen.has'));
ok('A17 top/arc兜底已移除(单条目不回填为批量列表)', !u1.includes('x/space/top/arc?vmid='));
ok('A18 legacy playurl基址', src.includes('x/player/playurl') && !src.includes('x/player/wbi/playurl'));
ok('A19 bxD速度控制(delay+jitter+失败冷却+跳过+持久化)',
  src.includes('bilibili_helper_batch_delay') && src.includes('Math.random()*dv*500') &&
  src.includes('dv*3e3') && src.includes('bilibili_helper_batch_done'));
ok('A20 逐集cid经pagelist', src.includes('x/player/pagelist?bvid='));

// ---- B) 39页重放(当前U1源码, p1=evidence真30条逐字节) ----
const p1 = JSON.parse(fs.readFileSync('evidence/up-list-pn1.json', 'utf8'));
const v1 = p1.data.list.vlist;
const count = p1.data.page.count;
const ps = 30, pages = Math.ceil(count / ps);
let fetchCalls = 0, wbiHits = 0;
const sleeps = [];
const bx0 = { cancel: false };
const bx2 = (ms) => { sleeps.push(ms); return Promise.resolve(); };
const V = { credentials: 'include' };
const E = { OK: 0 };
const mkFetch = (scenario) => async (url) => {
  fetchCalls++;
  const s = String(url);
  if (/wbi/i.test(s)) wbiHits++;
  const m = s.match(/[?&]pn=(\d+)/);
  const pn = m ? +m[1] : 1;
  if (scenario && scenario.failAt === pn) return { json: async () => ({ code: scenario.code, message: 'mock-fail' }) };
  if (pn === 1) return { json: async () => ({ code: 0, data: { list: { vlist: v1 }, page: { count } } }) };
  if (pn <= pages) {
    const n = pn < pages ? ps : (count - (pages - 1) * ps);
    const vl = [];
    for (let k = 0; k < n; k++) {
      const b = v1[k % v1.length];
      vl.push({ aid: b.aid + pn * 100000 + k, bvid: b.bvid + '_p' + pn + '_' + k, title: b.title + '[p' + pn + ']' });
    }
    return { json: async () => ({ code: 0, data: { list: { vlist: vl }, page: { count } } }) };
  }
  return { json: async () => ({ code: 0, data: { list: { vlist: [] }, page: { count } } }) };
};
const factory = new Function('bx0', 'bx2', 'V', 'E', 'window', 'esc', u1line + '; return U1;');
const runU1 = (fetchFn) => factory({ cancel: false }, bx2, V, E, { fetch: fetchFn }, String)(396395171, () => {});
fetchCalls = 0; wbiHits = 0; sleeps.length = 0;
const list = await runU1(mkFetch(null));
const bvids = list.map(x => x.bvid);
const replay = {
  total_expected: count, pages_expected: pages,
  got_len: list.length, uniq: new Set(bvids).size, partial: list.partial || false,
  fetchCalls, wbiHits,
  first30_real: v1.map(x => x.bvid).every((b, k) => bvids[k] === b),
  first: list[0] && list[0].bvid, last: list[list.length - 1] && list[list.length - 1].bvid,
  sleeps_min: Math.min(...sleeps), sleeps_max: Math.max(...sleeps),
  converged: list.length === count && new Set(bvids).size === count
};
ok('B1 39页收敛1159/1159', replay.converged, `got=${replay.got_len} uniq=${replay.uniq}`);
ok('B2 首30条与真机逐字节一致', replay.first30_real === true, `first=${replay.first}`);
ok('B3 全程零wbi调用', replay.wbiHits === 0 && replay.fetchCalls === 39, `fetch=${replay.fetchCalls}`);
ok('B4 页间隔全部1500-2300ms', replay.sleeps_min >= 1500 && replay.sleeps_max <= 2300, `${replay.sleeps_min}-${replay.sleeps_max}`);
ok('B5 非partial全量', replay.partial === false);

// ---- C) 预算场景(零抛错 + fetch有界 + partial语义) ----
async function scenario(name, fetchFn, expect) {
  fetchCalls = 0;
  let threw = null, res = null;
  try { res = await runU1(fetchFn); } catch (e) { threw = String((e && e.message) || e); }
  const r = { len: res ? res.length : -1, partial: res ? !!res.partial : null, fetchCalls, threw };
  const pass = threw === null && r.len === expect.len && r.partial === expect.partial && r.fetchCalls <= expect.maxFetch;
  ok('C ' + name, pass, JSON.stringify(r));
  return { name, ...r, expect };
}
// C1: p5处-352, 已抓120条 → partial返回, 无抛错, fetch=5(无兜底调用, 因有已抓页直接降级)
const c1 = await scenario('中途-352已抓120条→partial无抛错', mkFetch({ failAt: 5, code: -352 }), { len: 120, partial: true, maxFetch: 6 });
// C2: 首屏-403零结果 → len0 partial, fetch=1(无top兜底调用, 单条目不再回填为批量列表)
const c2 = await scenario('首屏-403零结果→空partial无抛错', mkFetch({ failAt: 1, code: -403 }), { len: 0, partial: true, maxFetch: 2 });
// C3: 首屏网络异常(u=null)×5 → 递增退避4次后放弃, len0 partial, fetch=5, 无抛错
const nullFetch = async (url) => { fetchCalls++; return { json: async () => null }; };
const c3 = await scenario('首屏网络异常→退避4次后空partial无抛错', nullFetch, { len: 0, partial: true, maxFetch: 6 });
// C4: -799持久(pn1处2次后退避恢复) → 全量, fetch=3, 无抛错
const b799 = mkFetch(null);
let h799 = 0;
const f799 = async (url) => {
  if (h799 < 2) { h799++; fetchCalls++; return { json: async () => ({ code: -799, message: '请求过于频繁，请稍后再试' }) }; }
  return b799(url);
};
const c4 = await scenario('-799两次后退避恢复→全量非partial', f799, { len: count, partial: false, maxFetch: 44 });

// ---- D) 报告 ----
const report = {
  generated_at: new Date().toISOString(),
  file: 'bilibili-helper-content-script.js',
  u1_line: lines.findIndex(l => l.includes('var U1=')) + 1,
  static: 'A1-A20见控制台',
  replay, scenarios: [c1, c2, c3, c4],
  live_note: 'live单发证据见evidence/live-nav-anon.json(匿名-101), evidence/live-top-arc.json(code0兜底可用), evidence/live-pn1-412.html(服务端IP冷却, 单发无重试)',
  pass: fail.length === 0
};
fs.writeFileSync('evidence/verify-report.json', JSON.stringify(report, null, 1) + '\n');
console.log('report: evidence/verify-report.json pass=' + report.pass);
if (fail.length) { console.log('FAILED: ' + fail.join(' | ')); process.exit(1); }
console.log('ALL VERIFY CHECKS PASS');
