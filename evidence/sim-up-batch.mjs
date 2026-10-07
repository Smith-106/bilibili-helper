// sim-up-batch.mjs — UP主批量下载腿离线行为仿真(零网络, 确定性):
//   node evidence/sim-up-batch.mjs → 落盘 evidence/sim-up-batch-result.json, exit 0 全过 / 1 失败
// 方法: 取主脚本“真实源码段”在 node 里 new Function 跑起来, 仅把 I/O 层换成受控替身:
//   新逻辑段 = var bxPn= .. var Dx= 之前 (含 bxPn/bxPgs/bxSp/bxSn/bxB/Bx + bx0/1/2/2c/5/6/7 + bxD, 未改写一字)
//   旧逻辑段 = git HEAD(3.0.36) var bx0= .. var Dx= 之前 (对照组, 未改写一字)
//   替身: window.fetch→编排好的 pagelist(多P/单P/-799/先败后好); d0→按cid编排playurl(-10403一次后好);
//         t0/R→只记录“会落下的文件名”; z→64; 计时器→同步立即执行(真实等待逻辑不变, 只是不耗时间)
// 断言: 无cid条目恰1次pagelist；多P就地展开入队；命名 视频标题_Pn_分P名；
//       skip 在解析之后真正生效；失败分类(需会员/登录 vs 其他)；失败清单+一键重试收敛；对照组复现旧病。
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const fail = [];
const realSetTimeout = setTimeout; // 计时替身经由它异步泵回调(同步泵会撞上 bx2c 的 id TDZ)
const ok = (name, cond, extra = '') => {
  console.log((cond ? '✓ ' : '✗ ') + name + (extra ? ' | ' + extra : ''));
  if (!cond) fail.push(name);
};

const src = fs.readFileSync('bilibili-helper-content-script.js', 'utf8');
const headSrc = execSync('git show HEAD:bilibili-helper-content-script.js', { stdio: 'pipe' }).toString();
const newSeg = src.slice(src.indexOf('var bxPn='), src.indexOf('var Dx='));
const oldSeg = headSrc.slice(headSrc.indexOf('var bx0='), headSrc.indexOf('var Dx='));
ok('S0 新源码含就地展开且旧 P1-only 写法已删', newSeg.includes('F0.splice(a+1,0,...ad') && !newSeg.includes('h.cid=pg.data[0].cid'));
ok('S0c 对照组确为旧代码(含 h.cid=pg.data[0].cid)', oldSeg.includes('h.cid=pg.data[0].cid'));
ok('S0d 旧代码行渲染+skip在cid解析之前(对照断言有效)', oldSeg.indexOf('bx5(P).includes(h.cid)') < oldSeg.indexOf('h.cid=pg.data[0].cid'));

// ---- 编排: 合成 UP 列表(U1 形状: 真实 aid/bvid, cid 全 0) ----
const EP2 = { aid: 117391421872075, bvid: 'BV1sNHf68EBp', title: 'Blender电影级叙事技法大师课', cid: 0 };
const EP3 = { aid: 117394190112761, bvid: 'BV17spc6sE7P', title: 'Blender二次元动漫风格化场景全流程', cid: 0 };
const SINGLE = { aid: 90000001, bvid: 'BV1SIMSINGLE1', title: '单集测试视频', cid: 0 };
const BADPG = { aid: 90000002, bvid: 'BV1SIMBADPG1', title: '分P列表会被拦截的视频', cid: 0 };
const BADDL = { aid: 90000003, bvid: 'BV1SIMBADDL1', title: '第2分P需要大会员的视频', cid: 0 };
const PAGES = {
  BV1sNHf68EBp: { code: 0, data: [
    { cid: 42499116682, page: 1, part: '1.01 - 欢迎来到本课程' },
    { cid: 42499178796, page: 2, part: '1.02 - 课程概览' },
    { cid: 42499200001, page: 3, part: '1.03 - 镜头解构' },
    { cid: 42499200002, page: 4, part: '1.04 - 准备素材' } ] },
  BV17spc6sE7P: { code: 0, data: [
    { cid: 42513468666, page: 1, part: '01 课程概述' },
    { cid: 42513531697, page: 2, part: '02-1 Blender基础与着色器入门' },
    { cid: 42513540001, page: 3, part: '02-2 几何节点进阶' } ] },
  BV1SIMSINGLE1: { code: 0, data: [{ cid: 90000001, page: 1, part: '正片' }] },
  BV1SIMBADDL1: { code: 0, data: [
    { cid: 80000011, page: 1, part: '第1集' },
    { cid: 80000012, page: 2, part: '第2集·大会员专属' },
    { cid: 80000013, page: 3, part: '第3集' } ] },
};
const VIP_ONCE = new Set([80000012]); // 该 cid 首次 playurl 回 -10403, 重试时成功

const mkLS = (seed = {}) => {
  const m = new Map(Object.entries(seed));
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
};
const mkNode = (tag) => {
  const n = { tag, children: [], parentNode: null, style: {}, dataset: {}, handlers: {}, _html: '',
    classList: { _s: new Set(), add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); }, contains(c) { return this._s.has(c); } },
    textContent: '', className: '', href: '', disabled: false, checked: false, value: '',
    scrollTop: 0, clientHeight: 100, scrollHeight: 100,
    appendChild(c) { c.parentNode = n; n.children.push(c); return c; }, // 与浏览器一致: 记录 parentNode(供 catch 的 p.parentNode||appendChild 判定)
    addEventListener(ev, fn) { (n.handlers[ev] = n.handlers[ev] || []).push(fn); } };
  Object.defineProperty(n, 'innerHTML', {
    get() { return n._html; },
    set(x) { n._html = String(x); if (!x) { n.children.forEach((c) => { c.parentNode = null; }); n.children.length = 0; } },
  });
  return n;
};

// ---- 驱动 ----
async function drive(seg, items, { skipCids = [], badpgSecondOk = true } = {}) {
  const fetchCalls = [], d0Calls = [], files = [], logs = [];
  let badpgCalls = 0;
  const win = {
    fetch: async (url) => {
      fetchCalls.push(url);
      const bv = (/pagelist\?bvid=([^&]+)/.exec(url) || [])[1];
      if (bv === 'BV1SIMBADPG1') {
        badpgCalls++;
        if (badpgSecondOk && badpgCalls > 1)
          return { json: async () => ({ code: 0, data: [{ cid: 80000001, page: 1, part: '正片' }] }) };
        return { json: async () => ({ code: -799, message: '请求过于频繁，请稍后再试' }) };
      }
      const hit = PAGES[bv];
      if (!hit) throw new Error('unexpected pagelist ' + bv);
      return { json: async () => JSON.parse(JSON.stringify(hit)) };
    },
    confirm: () => true,
    prompt: () => null, // 失败清单复制降级 prompt(仿真里直接返回)
  };
  const prelude = [
    'var E={OK:0,FAILED_TO_FETCH:-1,INVALID_RESPONSE:-2,VIP_ONLY:-10403,UNKNOWN:-99999};',
    'var V={credentials:"include"};',
    'var x={64:"720P 准高清"};',
    'var esc=e=>String(e==null?"":e);',
    'var q={blobUrls:new Set(),ffmpegUsedFiles:new Set(),ffmpegInstance:{deleteFile:async()=>{}}};',
    'var v=(...a)=>{logs.push(a.join(" "))};',
    'var z=async()=>64;',
    'var d0=async(aid,bvid,cid)=>{d0Calls.push(cid);if(VIP_ONCE.has(cid)){VIP_ONCE.delete(cid);return{code:-10403,message:"抱歉您正在观看的是大会员专属视频"}}return{code:0,dash:{audio:{base_url:"a:"+cid,size:1},video:{base_url:"v:"+cid,size:2}}}};',
    'var t0=async(f,p,S,name)=>{files.push("merge:"+name)};',
    'var R=async(p,f,name)=>{files.push("direct:"+name)};',
  ].join('\n');
  const prog = prelude + '\n' + seg + '\n' + 'return{bx0,bxD};';
  const factory = new Function('window', 'document', 'localStorage', 'navigator', 'setTimeout', 'setInterval', 'clearInterval',
    'VIP_ONCE', 'logs', 'd0Calls', 'files', prog);
  const fakeSetTimeout = (fn) => { fn(); return 0; };
  // bx2c 用 setInterval 轮询等待: 必须先返回 id 再异步泵 tick(同步泵会撞上
  // `let t=setInterval(...)` 的 TDZ), 用真 setTimeout 链驱动, 不耗真实等待时长
  let nextTimerId = 1;
  const liveTimers = new Map();
  const fakeSetInterval = (cb) => {
    const id = nextTimerId++;
    liveTimers.set(id, true);
    const tick = () => {
      if (!liveTimers.get(id)) return;
      cb();
      if (liveTimers.get(id)) realSetTimeout(tick, 0);
    };
    realSetTimeout(tick, 0);
    return id;
  };
  const fakeClearInterval = (id) => { liveTimers.delete(id); };
  const lsSeed = { bilibili_helper_batch_delay: '0.05' };
  if (skipCids.length) lsSeed.bilibili_helper_batch_done = JSON.stringify({ upSIM: { cids: skipCids } });
  const nodes = { 'batch-btn': mkNode('button'), 'batch-cancel': mkNode('button'), 'batch-status': mkNode('span'), 'batch-progress': mkNode('ul'), 'batch-skip': mkNode('input'), 'up-btn': mkNode('button'), 'batch-resume': mkNode('div') };
  nodes['batch-skip'].checked = skipCids.length > 0;
  const e = { getElementById: (id) => nodes[id] || null };
  const doc = { createElement: (t) => mkNode(t) };
  const t = JSON.parse(JSON.stringify(items));
  const ctx = factory(win, doc, mkLS(lsSeed), {}, fakeSetTimeout, fakeSetInterval, fakeClearInterval, VIP_ONCE, logs, d0Calls, files);
  await ctx.bxD(e, t, 'upSIM', undefined);
  const snap = () => ({
    status: nodes['batch-status'].textContent,
    rows: nodes['batch-progress'].children.map((c) => c.innerHTML),
    failLog: ctx.bx0.failLog.slice(),
    failItems: ctx.bx0.failItems.length,
    files: files.slice(), d0Calls: d0Calls.slice(), fetchCalls: fetchCalls.slice(),
  });
  const retryBtn = nodes['batch-status'].children.find((c) => c.tag === 'a' && /重试失败/.test(c.textContent || ''));
  const retry = async () => {
    retryBtn.handlers.click[0]({ preventDefault() {} });
    for (let i = 0; i < 20000 && ctx.bx0.running; i++) { await new Promise((r) => setImmediate(r)); }
    if (ctx.bx0.running) throw new Error('retry did not settle');
    return snap();
  };
  return { ...snap(), bx0: ctx.bx0, hasRetry: !!retryBtn, retry };
}

const list = () => [EP2, EP3, SINGLE, BADPG, BADDL].map((x) => ({ ...x }));

// ---- A) 新逻辑全流程 ----
const A = await drive(newSeg, list(), { skipCids: [42499116682, 90000001] });
const rowText = A.rows.join('‖');
ok('A1 每个无cid条目恰拉1次pagelist(5条→5次, 已展开分P不再各拉)', A.fetchCalls.length === 5, 'fetch=' + A.fetchCalls.length);
ok('A2 队列展开: 5条→12行(4+3+1+1+3)', A.rows.length === 12, 'rows=' + A.rows.length);
ok('A3 本集改名+后续分P命名=视频标题_Pn_分P名', rowText.includes('大师课_P1_1.01 - 欢迎来到本课程') && rowText.includes('大师课_P2_1.02 - 课程概览') && rowText.includes('全流程_P3_02-2 几何节点进阶'));
ok('A4 playurl 按逐分P cid 调用(9次=3+3+0+0+3)', A.d0Calls.length === 9, 'd0=' + A.d0Calls.length);
ok('A5 skip 在解析之后真正生效(成功8 跳过2)', /成功8 跳过2/.test(A.status), A.status);
ok('A6 失败分类: 需会员/登录1(大会员P2)+其他1(pagelist-799)', /需会员\/登录1，其他1/.test(A.status), A.status);
ok('A7 会落下的8个文件全部 P 命名+序号前缀(首个=002_P2)', A.files.length === 8 && A.files.every((f) => /_P\d+_/.test(f)) && /^merge:002_.*_P2_/.test(A.files[0]), A.files[0]);
ok('A8 失败清单2条含原因(pagelist-799/大会员)', A.failLog.length === 2 && /分P列表获取失败.*-799/.test(A.failLog[0]) && /大会员/.test(A.failLog[1]), A.failLog.join(' ‖ '));
ok('A8b 失败行渲染2条✘', (rowText.match(/✘/g) || []).length === 2);

// ---- B) 一键重试收敛 ----
ok('B0 出现「重试失败2集」按钮', A.hasRetry);
const B = A.hasRetry ? await A.retry() : null;
ok('B1 重试轮 2 集全成功(成功2/失败0)', !!B && /成功2/.test(B.status) && /失败0/.test(B.status), B && B.status);
ok('B2 重试只补2次playurl, 不重下已成功', !!B && B.d0Calls.length === A.d0Calls.length + 2, B && ('d0=' + B.d0Calls.length));

// ---- C) 对照组: 旧代码同样输入 ----
const C = await drive(oldSeg, [EP2, EP3, SINGLE].map((x) => ({ ...x })), { skipCids: [42499116682, 90000001] });
ok('C1 旧代码只产出 P1(3个文件, 无_P命名)', C.files.length === 3 && C.files.every((f) => !/_P\d+_/.test(f)), C.files.join(' | '));
ok('C2 旧代码 skip 永不命中(0跳过: EP2-P1与单集被重复下载)', /跳过0/.test(C.status), C.status);

const report = { generated_at: new Date().toISOString(), new_flow: { status: A.status, files: A.files, fetch: A.fetchCalls.length, d0: A.d0Calls.length }, retry_status: B && B.status, control: { files: C.files, status: C.status }, pass: fail.length === 0 };
fs.writeFileSync('evidence/sim-up-batch-result.json', JSON.stringify(report, null, 1) + '\n');
console.log('report: evidence/sim-up-batch-result.json pass=' + report.pass);
if (fail.length) { console.log('FAILED: ' + fail.join(' | ')); process.exit(1); }
console.log('ALL SIM CHECKS PASS');
