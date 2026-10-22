// verify-u1-bxd.mjs — U1+bxD 独立验证 harness(零网络, 可被 verifier 直接复跑):
//   node evidence/verify-u1-bxd.mjs  →  落盘 evidence/verify-report.json
// 覆盖:
//   A) 静态: U1走legacy零签名 / 全仓无wbi死代码 / U1无throw无登录无-403/-401 / fetch预算2 / 间隔与退避与上限与去重
//   B) 重放: 当前U1源码 + evidence/up-list-pn1.json 真实30条逐字节(p1) + 确定性派生p2-p39 → 39页收敛
//      B6-B13: 合集多P真实状态重放 — evidence/season-multip-state.json(用户提交页面 __INITIAL_STATE__ 抽取)
//              4 个分集各为多P课程(90/120/56/58) → Bx 展开 324 条, cid 与分集 pages 逐字节对齐;
//              另覆盖 无合集单视频多P / 无pages无avl(chk补展开) / 无pages有avl / 普通合集单P 四个不回归场景
//   C) 预算场景: 中途-352 / 首屏-403+top兜底 / 首屏网络异常+兜底空 → 全部无抛错、partial降级、fetch有界
//   E) 完整性: U1回传expected/miss语义 + 常驻条bx8/up-integrity/重抓按钮 + Dv落盘lastUplist
//   D) 链路: bxD速度控制(pagelist/persist/delay/jitter/失败冷却/跳过) via 离线仿真 evidence/sim-up-batch.mjs:
//      5条无cid(UP列表形状)→恰5次pagelist→展开12行(4+3+1+1+3)→playurl逐分P cid(9次)→成功8/跳过2/失败2(需会员1+其他1);
//      失败行渲染2条✘(分P列表失败也必须有行, 不得隐身); 「重试失败」按钮一键收敛(成功2/失败0, 只补2次playurl);
//      对照组(HEAD旧bxD): 只产出P1(3文件无_P命名)且skip永不命中(跳过0)
import fs from 'node:fs';
import { execSync } from 'node:child_process';

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
ok('A13 档位联动页间隔+起步settle(base档位+settle)', u1.includes('dv>=18?8500') && u1.includes('bx2(2000+Math.floor(Math.random()*1000))') && u1.includes('base+ex+Math.floor'));
ok('A14 pn1双败fast-fail+15min冷却记忆', u1.includes('bilibili_helper_uplist_cool_') && u1.includes('9e5') && u1.includes('cool=!0'));
ok('A14b 中途-799加长退避≤4次(20-41s)+自适应放慢ex+耗尽写冷却', u1.includes('rt<4') && u1.includes('14000+rt*6000') && u1.includes('ex=Math.min(6000,ex+2000)'));
ok('A14c 缓存failover(老缓存partial继续)', u1.includes('bilibili_helper_uplist_') && u1.includes('o.cached=!0'));
ok('A15 t>=40上限', u1.includes('t>=40'));
ok('A16 seen去重', u1.includes('seen=new Set') && u1.includes('seen.has'));
ok('A17 top/arc兜底已移除(单条目不回填为批量列表)', !u1.includes('x/space/top/arc?vmid='));
ok('A18 legacy playurl基址', src.includes('x/player/playurl') && !src.includes('x/player/wbi/playurl'));
ok('A19 bxD速度控制(delay+jitter+失败冷却+跳过+持久化)',
  src.includes('bilibili_helper_batch_delay') && src.includes('Math.random()*dv*500') &&
  src.includes('dv*3e3') && src.includes('bilibili_helper_batch_done'));
ok('A20 逐集cid经pagelist', src.includes('x/player/pagelist?bvid='));
ok('A21 U1回传expected+cacheTs(完整性数据源)', u1.includes('o.expected=') && u1.includes('o.cacheTs=') && u1.includes('m.expected=0'));
ok('A22 常驻完整性条bx8+up-integrity+重抓按钮', src.includes('var bx8=') && src.includes('id="up-integrity"') && src.includes('重抓完整列表'));
ok('A23 Dv落盘lastUplist并重渲染(W0恢复)', src.includes('lastUplist') && src.includes('bx8(e,t)') && src.includes('bx0.lastUplist&&bx8(e,bx0.lastUplist)'));
const dvi = src.indexOf('var Dv='), duj = src.indexOf('var U1=');
const dvseg = dvi >= 0 && duj > dvi ? src.slice(dvi, duj) : '';
ok('A24 Dv缓存/部分二次确认(confirm+取消停手复位)', dvseg.includes('window.confirm') && dvseg.includes('已取消') && dvseg.includes('bx0.running=!1') && dvseg.includes('重抓完整列表'));
ok('A25 H自定义元素幂等(get判重+try/catch,防二次define无面板)', src.includes('customElements.get(B)||') && src.includes('customElements.define(B'));
try {
  execSync('node --experimental-vm-modules evidence/mod-parse-check.mjs', { stdio: 'pipe' });
  ok('A26 主脚本module语义可解析(与浏览器type=module注入一致,防模板闭合符误写致整文件无面板)', true);
} catch (e) { ok('A26 主脚本module语义可解析(与浏览器type=module注入一致,防模板闭合符误写致整文件无面板)', false, 'mod-parse-check exit!=0'); }
const bdi = src.indexOf('var bxD='), bdj = src.indexOf('var Dx=');
const bxd = bdi >= 0 && bdj > bdi ? src.slice(bdi, bdj) : '';
ok('A27 失败一键重试(failItems+重试失败N集按钮,仅重跑失败项)', bxd.includes('bx0.failItems') && bxd.includes('重试失败') && bxd.includes('bxD(e,t,P,'));
ok('A28 失败分类计数(需会员/登录vs其他)', bxd.includes('Q1v') && bxd.includes('Q1x') && bxd.includes('需会员/登录'));
ok('A29 开始行ETA预估(集数×速度档,不含下载耗时)', bxd.includes('预计集间等待约') && bxd.includes('不含下载/合并耗时'));
ok('A30 Dv缓存文案小时数(不用Math.max(1,1)写死)', src.includes('小时前缓存列表') && !src.includes('Math.max(1,1)'));
ok('A31 bxD结尾复位up-btn(修Dv成功路径up-btn永久disabled)', bxd.includes('getElementById("up-btn")') && bxd.includes('ub.disabled=!1'));
ok('A32 bxD开头running守护(防重试按钮双击并发两轮)', /var bxD=async\(e,t,P,only\)=>\{\s*if\(bx0\.running\)return/.test(src));
ok('A33 正在处理行剩余ETA(剩约X分)', (bxd.match(/剩约\$/g) || []).length >= 2);
ok('A34 skip计数(已有N集)', src.includes('childNodes[1].nodeValue') && src.includes('已有${c.length}集'));
ok('A35 UP主关键词筛选(up-kw输入+encodeURIComponent+缓存key隔离)', src.includes('id="up-kw"') && src.includes('encodeURIComponent(kw||"")') && src.includes('_kw"') && src.includes('U1(d.mid,n=>o.textContent=n,kw2)'));
ok('A36 下载腿受限计数(th判-799/频繁/412/未返回DASH)', bxd.includes('th++') && bxd.includes('/频繁|限制|412|风控|未返回DASH/'));
ok('A37 下载腿连续受限原地冷却5分钟继续', bxd.includes('th>=3') && bxd.includes('300e3') && bxd.includes('原地冷却'));
ok('A38 受限即时拉长集间(wt×(1+th*2))', bxd.includes('wt=Math.max(wt,dv*(1+th*2)*1e3)'));
ok('A39 UI卡片化+批量进度滚动+失败行底色+收起态toggle小型化', src.includes('#batch-progress{max-height: 280px;overflow-y: auto') && src.includes('li.b-fail{background: #fdf0f0}') && src.includes('#up-integrity>span{display: inline-block;background: #f0f6fa') && src.includes('.hide #toggle{font-size: 11px'));
ok('A40 可中断等待bx2c(500ms粒度查cancel)', src.includes('var bx2c=') && src.includes('bx0.cancel||r<=0'));
ok('A41 原地冷却倒计时+可取消(cr循环每10s更新剩时)', bxd.includes('剩${Math.floor(cr/6e4)}分') && bxd.includes('可点取消'));
ok('A42 集间等待前status提示(等待Ns后下一集)', bxd.includes('等待${Math.round(wt/1e3)}s后下一集'));
ok('A43 取消按钮即时disable(防连点)', src.includes('d.disabled=!0,o.textContent') && src.includes('d.disabled=!1,bx0.running=!1'));
ok('A44 当前集行b-cur脉动高亮+完成/失败移除', bxd.includes('p.classList.add("b-cur")') && bxd.includes('p.classList.remove("b-cur")') && src.includes('.b-cur{background: #eef6ff'));
ok('A45 结束行耗时统计(用时X分Y秒)', bxd.includes('st0=Date.now()') && bxd.includes('${es}'));
ok('A46 progress自动跟随近底(r.scrollTop跟随)', bxd.includes('r.scrollTop+r.clientHeight>=r.scrollHeight-60'));
ok('A47 多P视频Bx展开(videos>1用pages构造每P一项)', src.includes('vd&&vd.videos>1&&Array.isArray(vd.pages)') && src.includes('var bxPgs=') && src.includes('c=(p.part||p.title||"").trim()||("P"+n)'));
ok('A48 多P批量键mp-<bvid>+文案全部P', src.includes('"mp-"+vd.bvid') && src.includes('批量下载本视频全部P'));
ok('A49 Dx空列表写UI状态行(非仅日志)', src.includes('o.textContent=" 未找到可批量下载的合集或分P"'));
ok('A50 batch-clear绑定守护(dataset.bound防W0重绑)', src.includes('bc.dataset.bound="1"'));
ok('A51 dash video-only降级为单链接durl(无声视频)', src.includes('durl:m&&p?a.durl:[{url:p.base_url,size:p.size,backup_url:p.backup_url}]'));
ok('A52 出错了message空兜底(无可用下载链接提示)', src.includes('无可用下载链接（可能该视频无音视频流'));
ok('A53 d0 playurl空data判定+未登录提示', src.includes('!t.dash&&!(t.durl&&t.durl.length)') && src.includes('请先登录后刷新重试'));
ok('A54 U空链接改INVALID_RESPONSE(不再code=OK空链接)', src.includes('p?{code:E.OK') && src.includes('接口未返回可用下载链接'));
ok('A55 support_formats可选(Object.values(c||{}))', src.includes('Object.values(c||{})'));
ok('A56 UI精简——删教程链接/赞赏区/notice iframe(版本/微信赞赏外部区)', !src.includes('使用教程及常见问题解答') && !src.includes('五星好评') && !src.includes('id="notice-frame"') && src.includes('if(!i)return')&&src.includes('J0=e=>'));
ok('A57 side-bar移除main撑满(flex:1)', !src.includes('id="side-bar"') && src.includes('#main {\n  flex: 1;'));
ok('A58 合集分集按分P展开(bxSp取分集pages>当前视频pages>availableVideoList.list)', src.includes('var bxSp=') && src.includes('e.aid===i.aid&&Array.isArray(i.pages)&&i.pages.length>1') && src.includes('p.list.length>1'));
ok('A59 分集取不到pages时留chk标记(下载腿按pagelist补展开,不退回只下P1)', src.includes('title:String(t),chk:1}]') && src.includes('!h.cid||h.chk'));
ok('A60 下载腿pagelist改为展开全分P并插入队列(删除data[0]只取P1)', src.includes('F0.splice(a+1,0,...ad') && !src.includes('h.cid=pg.data[0].cid'));
ok('A61 分P命名{标题}_P{n}_{分P名}(尾部保留,超80仅截标题前缀)', src.includes('var bxPn=') && src.includes('"_P"+e+"_"+i') && src.includes('String(t||"").slice(0,o)'));
ok('A62 按钮文案区分集数与分P数(N集/共M个分P)', src.includes('集/共${n}个分P') && src.includes('ne=bxSn(r)'));
ok('A63 旧「合集只取每集首P」映射已移除(回归防护)', !src.includes('d.some(t=>t.cid===a.cid)||d.push({aid:a.aid'));
const iRes = src.indexOf('if(!h.cid||h.chk)'), iCur = src.indexOf('p.classList.add("b-cur")'), iSkip = src.indexOf('u&&u.checked&&bx5(P).includes(h.cid)');
ok('A64 cid解析/多P展开先于行渲染与skip判定(UP列表skip与命名才拿得到真cid)', iRes > 0 && iRes < iCur && iCur < iSkip);
ok('A65 分P列表失败带接口码(受限计th走原地冷却,不静默继续)', src.includes('分P列表获取失败：') && src.includes('-799||/频繁|限制|412|风控|未返回DASH/'));

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
ok('B4 页间隔档位内(默认3s档4500-7000ms)', replay.sleeps_min >= 2000 && replay.sleeps_max <= 7500 && replay.sleeps_min < replay.sleeps_max, `${replay.sleeps_min}-${replay.sleeps_max}`);
ok('B5 非partial全量', replay.partial === false);

// ---- B6-B13) 合集多P真实状态重放(用户提交页面的 __INITIAL_STATE__ 抽取, 零网络) ----
// 现场: https://www.bilibili.com/video/BV1jnHf6JEdk/ 合集「Blender教程合集（1/4）」
//       4 个分集各自都是多P课程(90/120/56/58 分P, 共 324)；v3.0.36 每集只 push 一个 cid(该集 P1) → 只下到 4 个
const bxSrc = src.slice(src.indexOf('var bxPn='), src.indexOf('var bx0='));
const runBx = (st) => new Function('window', bxSrc + '; return Bx();')({ __INITIAL_STATE__: JSON.parse(JSON.stringify(st)) });
const fx = JSON.parse(fs.readFileSync('evidence/season-multip-state.json', 'utf8'));
const fxEps = fx.videoData.ugc_season.sections.flatMap((s) => s.episodes);
const L = runBx(fx);
const perBvid = {}; L.forEach((x) => { perBvid[x.bvid] = (perBvid[x.bvid] || 0) + 1; });
const cidAligned = fxEps.every((e) => {
  const got = L.filter((x) => x.bvid === e.bvid).map((x) => x.cid);
  return got.length === e.pages.length && e.pages.every((p, k) => got[k] === p.cid);
});
const ep2 = L.filter((x) => x.bvid === 'BV1sNHf68EBp');
const seasonReplay = {
  fixture: 'evidence/season-multip-state.json',
  episodes: fxEps.length, ep_parts: fxEps.map((e) => e.pages.length),
  got_len: L.length, uniq: new Set(L.map((x) => x.cid)).size, seasonEps: L.seasonEps,
  per_bvid: perBvid, cid_aligned: cidAligned, max_title_len: Math.max(...L.map((x) => x.title.length)),
  first: L[0] && L[0].title, ep2_p2: ep2[1] && ep2[1].title, last: L[L.length - 1] && L[L.length - 1].title,
  no_season: null, no_pages_no_avl: null, no_pages_with_avl: null, plain_collection: null,
};
ok('B6 合集4集×多P展开324集(90/120/56/58),cid逐字节对齐分集pages',
  L.length === 324 && new Set(L.map((x) => x.cid)).size === 324 && cidAligned && L.every((x) => !!x.cid),
  `len=${L.length} uniq=${new Set(L.map((x) => x.cid)).size} aligned=${cidAligned}`);
ok('B7 每集都出全(不再只出每集首P)', perBvid['BV1jnHf6JEdk'] === 90 && perBvid['BV1sNHf68EBp'] === 120 && perBvid['BV17spc6sE7P'] === 56 && perBvid['BV1D3HZ6iE23'] === 58, JSON.stringify(perBvid));
ok('B8 分P命名=视频标题_Pn_分P名(≤80,尾部可识别)', L[0].title.endsWith('_P1_1.01 - 欢迎来到本课程') && ep2[1].title === 'Blender电影级叙事技法大师课_P2_1.02 - 课程概览' && Math.max(...L.map((x) => x.title.length)) <= 80);
ok('B9 按钮文案数据源seasonEps=4且ep_count一致', L.seasonEps === 4 && fx.videoData.ugc_season.ep_count === 4);
const stA = JSON.parse(JSON.stringify(fx)); delete stA.videoData.ugc_season;
const LA = runBx(stA);
seasonReplay.no_season = { len: LA.length, first: LA[0] && LA[0].title };
ok('B10 无合集单视频多P回退仍为90P(标题=分P名,cid对齐pages,不回归)', LA.length === 90 && LA[0].title === '1.01 - 欢迎来到本课程' && LA[89].cid === fx.videoData.pages[89].cid);
const stB = JSON.parse(JSON.stringify(fx));
stB.videoData.pages = [stB.videoData.pages[0]];
stB.videoData.ugc_season.sections[0].episodes.forEach((e) => { e.pages = null; });
stB.availableVideoList = stB.availableVideoList.filter((v) => (v.list || []).length <= 1);
const LB = runBx(stB);
seasonReplay.no_pages_no_avl = { len: LB.length, chk: LB.map((x) => x.chk) };
ok('B11 分集无pages且无avl→4集带chk标记(交下载腿按pagelist补展开,而非静默只下P1)',
  LB.length === 4 && LB.every((x) => x.chk === 1) && LB.map((x) => x.cid).join() === fxEps.map((e) => e.cid).join());
const stC = JSON.parse(JSON.stringify(fx));
stC.videoData.ugc_season.sections[0].episodes.forEach((e) => { e.pages = null; });
const LC = runBx(stC);
seasonReplay.no_pages_with_avl = { len: LC.length };
ok('B12 分集无pages时走availableVideoList.list展开(仍324)', LC.length === 324 && new Set(LC.map((x) => x.cid)).size === 324);
const stD = JSON.parse(JSON.stringify(fx));
stD.videoData.pages = [stD.videoData.pages[0]];
stD.videoData.ugc_season.sections[0].episodes.forEach((e) => { e.pages = [e.pages[0]]; });
stD.availableVideoList = stD.availableVideoList.filter((v) => (v.list || []).length <= 1);
const LD = runBx(stD);
seasonReplay.plain_collection = { len: LD.length };
ok('B13 普通合集(4集各单P)仍为4集不误伤(标题=分集标题)', LD.length === 4 && LD.map((x) => x.cid).join() === fxEps.map((e) => e.cid).join() && LD[0].title === fxEps[0].title);

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
// C5: pn1双败-799写入冷却+无缓存 → cool数组len0, fetch=2, 无抛错(第二次调用零请求直接cool)
const c1 = await scenario('中途-352已抓120条→partial无抛错', mkFetch({ failAt: 5, code: -352 }), { len: 120, partial: true, maxFetch: 6 });
// C2: 首屏-403零结果 → len0 partial, fetch=1(无top兜底调用, 单条目不再回填为批量列表)
const c2 = await scenario('首屏-403零结果→空partial无抛错', mkFetch({ failAt: 1, code: -403 }), { len: 0, partial: true, maxFetch: 2 });
// C3: 首屏网络异常(u=null)×2 → pn1双败fast-fail进15min冷却, len0 cool(非partial数组), fetch=2, 无抛错
const nullFetch = async (url) => { fetchCalls++; return { json: async () => null }; };
const c3 = await scenario('首屏网络异常→pn1双败fast-fail进冷却无抛错', nullFetch, { len: 0, partial: false, maxFetch: 3 });
// C4: -799在pn1处1次后恢复 → 全量, fetch=2+39, 无抛错(pn1双败阈=1次重试)
const b799 = mkFetch(null);
let h799 = 0;
const f799once = async (url) => {
  if (h799 < 1) { h799++; fetchCalls++; return { json: async () => ({ code: -799, message: '请求过于频繁，请稍后再试' }) }; }
  return b799(url);
};
const c4 = await scenario('-799一次后恢复→全量非partial', f799once, { len: count, partial: false, maxFetch: 42 });

// C5: 冷却记忆 — 同一mid第二次调用直接cool零请求(Factory级localStorage mock)
// C6: 中途-799两次后恢复 → 增量继续+自适应ex>0 → 全量非partial, 无抛错
async function scenarioCool(name, fetchFn, expect) {
  fetchCalls = 0;
  const store = {};
  const ls = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } };
  const fac = new Function('bx0', 'bx2', 'V', 'E', 'window', 'localStorage', 'esc', u1line + '; return U1;');
  const runC = (ff) => fac({ cancel: false }, bx2, V, E, { fetch: ff }, ls, String)(396395171, () => {});
  let threw = null, r1 = null, r2 = null;
  try { r1 = await runC(fetchFn); r2 = await runC(fetchFn); } catch (e) { threw = String((e && e.message) || e); }
  const r = { len1: r1 ? r1.length : -1, cool1: r1 ? !!r1.cool : null, len2: r2 ? r2.length : -1, cool2: r2 ? !!r2.cool : null, fetchCalls, threw, coolKey: Object.keys(store).find((k) => k.includes('uplist_cool_')) || null };
  const pass = threw === null && r.len1 === expect.len && r.cool1 === true && r.cool2 === true && r.fetchCalls <= expect.maxFetch && !!r.coolKey;
  ok('C ' + name, pass, JSON.stringify(r));
  return { name, ...r, expect };
}
const f799cool = (() => { let k = 0; return async (url) => { fetchCalls++; if (k < 2) { k++; return { json: async () => ({ code: -799, message: 'x' }) }; } return { json: async () => ({ code: 0, data: { list: { vlist: [] }, page: { count: 0 } } }) }; }; })();
const c5 = await scenarioCool('pn1双败-799进冷却+二次零请求cool无抛错', f799cool, { len: 0, maxFetch: 3 });

// C6: 中途(pn3处)-799两次后恢复 → 退避后增量继续, 全量非partial, 无抛错
const bMid = mkFetch(null);
let hMid = 0;
const fMid = async (url) => {
  const m = String(url).match(/[?&]pn=(\d+)/);
  const pn = m ? +m[1] : 1;
  if (pn === 3 && hMid < 2) { hMid++; fetchCalls++; return { json: async () => ({ code: -799, message: 'x' }) }; }
  return bMid(url);
};
const c6 = await scenario('中途pn3-799两次后恢复→增量继续全量无抛错', fMid, { len: count, partial: false, maxFetch: 43 });

// ---- E) 完整性字段(零网络, 同一runU1) ----
fetchCalls = 0;
const full = await runU1(mkFetch(null));
ok('E1 全量expected==count且cacheTs>0', full.expected === count && full.cacheTs > 0 && full.partial === false, `expected=${full.expected} cacheTs=${full.cacheTs ? 'set' : 'unset'}`);
fetchCalls = 0;
const part = await runU1(mkFetch({ failAt: 5, code: -352 }));
ok('E2 部分expected==count且缺数==expected-len', part.expected === count && (part.expected - part.length) === (count - 120) && part.partial === true, `expected=${part.expected} len=${part.length} miss=${part.expected - part.length}`);
fetchCalls = 0;
const cool = await runU1(nullFetch);
ok('E3 冷却expected==0且cool标记', cool.expected === 0 && cool.cool === true && cool.cacheTs === 0, `expected=${cool.expected} cool=${!!cool.cool}`);

// ---- D) 链路: UP批量下载腿离线仿真(sim-up-batch.mjs, 真源码段+受控I/O, 零网络) ----
try {
  const sim = execSync('node evidence/sim-up-batch.mjs', { stdio: 'pipe' }).toString();
  const n = (sim.match(/^✓/gm) || []).length;
  ok('D1 sim全过(17✓: 无cid恰1次pagelist/12行展开/逐P命名/skip生效/失败分类/重试收敛/旧代码对照)', n === 17 && sim.includes('ALL SIM CHECKS PASS'), `got=${n}`);
} catch (e) { ok('D1 sim全过(17✓: 无cid恰1次pagelist/12行展开/逐P命名/skip生效/失败分类/重试收敛/旧代码对照)', false, 'sim exit!=0'); }
ok('D2 分P列表失败也必须有行(不得隐身)', src.includes('p.parentNode||r.appendChild(p)'));
try {
  const rsm = execSync('node evidence/sim-o0-resume.mjs', { stdio: 'pipe' }).toString();
  const rn = (rsm.match(/^✓/gm) || []).length;
  ok('D3 o0停滞续传仿真全过(30✓: 真源码段+受控桩: 干净一致/整理不重试/僵死Range续传/无206回退/403直抛/5轮耗尽/拼不成整块仍可保存/小块也交出/超限边下边写/没文件夹先停住/页面满了改交Blob/失败后续着下/关掉页面仍接着下/各文件断点互不覆盖/文件对不上就从头下/旧尾巴先截掉/没文件夹不读半截/不能选文件夹就从头下/不报告空间时较大的一份先停住或边下边写/单个视频先选文件夹再下一次/权限失效就丢掉文件夹/接着下时仍留着错误名/这一份放下去会过满时先停住或边写)', rn === 30 && rsm.includes('ALL SIM CHECKS PASS'), `got=${rn}`);
} catch (e) { ok('D3 o0停滞续传仿真全过(9✓: 真源码段+受控I/O)', false, 'sim exit!=0'); }
ok('A66 批量行结构化(b-idx计数列+b-ep标题+b-st状态, b-cur用outline描边, batch-status块级, reduced-motion全关)', src.includes('<span class="b-idx">') && src.includes('<span class="b-st">') && src.includes('.b-idx{display: inline-block;min-width: 7ch;text-align: right') && src.includes('.b-cur{background: #eef6ff;outline: 2px solid #7cc4e8') && src.includes('#batch-status{display: block') && src.includes('@media (prefers-reduced-motion: reduce)')); // v3.0.38 UI(批量区层次+可读性, 四位宽计数不再随324跳动, 原单行模板逐条迁移见bxD五处row)
ok('A67 合并MEMFS不泄漏(_0清理输出文件+a0对象URL自回收+t0合并失败显错+beforeunload空实例守护)', src.includes('a.deleteFile(t).catch') && src.includes('q.blobUrls.delete(N)},6e5)') && src.includes('a.innerHTML=" ✘ "+esc(Gm)') && src.includes('q.ffmpegInstance?q.ffmpegInstance.deleteFile(e):Promise.resolve()') && src.includes('catch(G){a.deleteFile(r).catch') && src.includes('throw Object.assign(G,{message:Gm})')); // v3.0.39 OOM文件泄漏 + v3.0.41 失败文案改写后仍显错并重抛(message换成可读原因, 批量记失败而非✔)
try {
  const rec = execSync('node evidence/sim-ffmpeg-recycle.mjs', { stdio: 'pipe' }).toString();
  const rcn = (rec.match(/^✓/gm) || []).length;
  ok('D4 合并器回收仿真全过(10✓: 每集terminate/OOM换新实例重试成功/两次OOM封顶/load失败不缓存)', rcn === 10 && rec.includes('ALL SIM CHECKS PASS'), `got=${rcn}`);
} catch (e) { ok('D4 合并器回收仿真全过(10✓: 每集terminate/OOM换新实例重试成功/两次OOM封顶/load失败不缓存)', false, 'sim exit!=0'); }
ok('A69 合并器每集销毁且OOM自动换新实例重试一次', src.includes('qK=()=>') && src.includes('i&&i.terminate()') && src.includes('q.ffmpegCore') && src.includes('q._oomR') && src.includes('内存不足，正在重建合并器并重试')); // v3.0.41 OOM根因: deleteFile不缩wasm堆, 爆掉的实例被T0缓存; 每集terminate置空, 核心URL缓存, OOM自动换新实例重试1次
try {
  const fb = execSync('node evidence/sim-merge-fallback.mjs', { stdio: 'pipe' }).toString();
  const fbn = (fb.match(/^✓/gm) || []).length;
  ok('D5 合并OOM分开保存仿真全过(9✓: 不丢已下载数据/先视频后音频/其它合并错误也分开保存/成功只存mp4/超限不进wasm/下载失败仍抛)', fbn === 9 && fb.includes('ALL SIM CHECKS PASS'), `got=${fbn}`);
} catch (e) { ok('D5 合并OOM分开保存仿真全过(9✓: 不丢已下载数据/先视频后音频/其它合并错误也分开保存/成功只存mp4/超限不进wasm/下载失败仍抛)', false, 'sim exit!=0'); }
ok('A70 合并OOM改为分开保存音视频(不把已下好的数据丢掉再重试)', src.includes('o+"_视频.mp4"') && src.includes('o+"_音频.m4a"') && src.includes('q.mergeNote="已分开保存音视频"') && src.includes('✔ ${esc(q.mergeNote||"已保存")}') && src.includes('q.mergeMax||700*1024*1024') && src.includes('超过浏览器合并上限') && src.includes('a[download]') && src.includes('合并失败（')); // v3.0.42 失败改分开保存; v3.0.43 音视频合计超过700MB时不再进wasm(峰值约2倍, 上限2GB, 硬闯会卡死页面且兜底来不及), 批量行重挂保存链接
ok('A71 批量汇总单列分开保存(不把未合并的集算进纯成功)', src.includes('Qs=0') && src.includes('q.mergeNote&&Qs++') && src.includes('${Qs?" 分开"+Qs:""}') && src.includes('其中分开保存的是视频和音频两个文件')); // v3.0.44 分开保存原先并进「成功」，汇总看起来像都合并好了; Qs=0 时文案与旧版逐字相同, 避免把未合并的集藏起来
try {
  const qm = execSync('node evidence/sim-qm.mjs', { stdio: 'pipe' }).toString();
  const qn = (qm.match(/^✓/gm) || []).length;
  ok('D6 页面内mp4合并仿真全过(125✓: 普通/分片/排队下载/按小块写入文件夹/没文件夹会要求再选/超限边下边写/下一集释放上一集/同一集第二份前也释放/页面满了先保存/选文件夹不再说成ffmpeg/不报告空间时先保存/合集里先选文件夹再下一次/下一份放下去会过满时先保存/合并前再留一份会过满就分开/合并时放不下就分开/同一集再次下载不再叠在一起/刷新后仍不再叠在一起/合并前先记住成功后忘掉/分配失败不再显示英文/合并器内存错误改为分开保存/重试换成另一个序号也分开/下另一份之前就记住/关掉标签页后仍分开/再留一份合并结果也会放不下/报告了剩余空间但再留一份结果会过满/下另一份之前就把合并结果算进去/不报告剩余空间时也给合并结果留位置/还不是字节块时按三份来留/名单写不下时仍记住这一集/写不下时只丢掉放不下的旧集/本地名单一个名字也写不下时记在页面里/页面记录能留下不止一集/一条页面记录写满后记到下一条/八条都满时仍记在浏览器数据库/数据库不可用时改记更多条/三十条也满时收成短标记/第一份还没下完就中断，重试仍分开保存/名单还没写完也先记住这一集/数据库还没返回也已经记住/翻名单之前就已经记住/两份字节块再留一份结果也分开保存/上一条还没看完也已经写下/名单已经满了就分开保存/不止一条轨道时说明原因/加密时说明原因/再留一份合成开销也分开保存/合成前页面又满了就分开保存/不报告剩余空间时结果太大也分开/做成文件失败也说页面放不下/选了文件夹就直接写入不再做整份/没选文件夹也先写入临时目录/写完就放开两份原件/能写入时进度不再说页面会卡住/整份下载失败会提示重试分开保存/上次还没写上名字就中断，这次分开保存/不报告剩余空间时十六分之一以上也分开/还没准备数据库就先记下/调用之前就记下/加密只在媒体数据里也说明原因/没写上名字只让下一集分开一次/不报告剩余空间时也不再整份合成/先放开原件再做成文件/复制和做成文件时说明进度/能挪走时不再复制一份/媒体数据 4KB 之后的加密也说明原因/逐段做成文件并放开已写入的一段/找合集之前就说明下次会分开/没点中就清掉这次标记/逐段做成文件时显示段数并让出/做成文件途中页面满了就停下/媒体数据 16KB 之后的加密也说明原因/浏览器不报告内存时按已写字节停下/文件夹写失败也不再一次复制成整块/页面放不下的失败重试会直接分开/单集失败会重新打开按钮并说明再点一次分开/写入文件夹时写完视频就放开/合集进度也写到总状态/取回文件前先放开音频/按下的第一句就先记一笔/单集一点击就先记一笔/只剩一份时先保存再重试/做成文件停在视频段时留下音频/停在音频第一段时这段还没送出/已经送出的音频段还能拼回来/视频段不再留一份引用/单独保存前先说明/失败行盖掉后仍能放回下载链接/合成成功后这一行重画仍留着下载/链接失效前会多留一会儿并说明/合集进度不再盖掉这一集的名字/失败时改掉原来的状态不再另起一行/收尾时不再整行重画/下一集开始前放开的链接会说明/放开上一集链接时改掉那一行/页面还空着时先留着上一集的链接/放开上一集时说明原因/重试前先写明这次分开保存/普通失败的重试先写成正在重试/重试没有状态时补上一句/重试按钮写明哪些分开保存)', qn === 125 && qm.includes('ALL SIM CHECKS PASS'), `got=${qn}`);
} catch (e) { ok('D6 页面内mp4合并仿真全过(33✓: 普通/分片/排队下载/按小块写入文件夹/没文件夹会要求再选/超限边下边写/下一集释放上一集/同一集第二份前也释放/页面满了先保存/选文件夹不再说成ffmpeg)', false, 'sim exit!=0'); }
ok('A72 能在页面内合并的音视频不再进wasm', src.includes('qM=(v,a)=>') && src.includes('q.jsMergeMax||1200*1024*1024') && src.includes('已在页面内合并音视频，未使用 ffmpeg') && src.includes('页面内合并跳过：') && src.includes('分片没有可用的样本偏移') && src.includes('视频不止一条轨道') && src.includes('视频已加密') && src.includes('合成结果放不下') && src.includes('浏览器没报告剩余空间，不再整份合成') && src.includes('q.holdMax!=null') && src.includes('qM.why="合并时页面放不下"') && src.includes('qM.wantParts') && src.includes('qM.deferBlob=!qM.wantParts') && src.includes('正在挪开原件，若卡住请点重试，重试会分开保存') && src.includes('Math.min(s.length,32776)') && src.includes('原件已放开，正在逐段做成文件，若卡住请点重试，重试会分开保存') && src.includes('owned[i]=null;i++;if(i===cut)say("视频段已放开，正在送音频");c.enqueue(p)') && src.includes('p.buffer.transfer') && src.includes('navigator.storage.getDirectory') && src.includes('audioU=null;await new Promise(r=>setTimeout(r,0));say("原件已放开，正在取回文件");jm=await fh.getFile()') && src.includes('正在写入文件夹 "+(i+1)+"/"+jm.parts.length') && src.includes('正在写入，不再整份放在页面里') && src.includes('合并时页面放不下，点重试会分开保存') && src.includes('note==="*"') && src.includes('q.mergeHold!=null') && src.split('catch(_){}try{document.cookie="bhnmpend=;path=/;max-age=0"}catch(_){}return id})()').length === 2 && src.includes(',_,bh)') && src.includes('let bh0=Math.random().toString(36).slice(2)') && src.includes('已记下，若这次卡住，下次会分开保存') && src.includes(':bh0;') && src.includes('markHead') && src.includes('note==="*"') && src.includes('max-age=0') && src.includes('音视频一个是分片一个不是') && src.includes('q.wasmSkip||400*1024*1024') && src.includes('超过 400MB，不再进 ffmpeg') && src.includes('q.wasmRetryMax||80*1024*1024') && src.includes('不再重试，改为分开保存') && src.includes('上次这里把浏览器撑住了') && src.includes('点重试会分开保存，不再进 ffmpeg') && src.includes('if(!q.useWasm)') && src.includes('这一集不进 ffmpeg，改为分开保存音视频') && src.includes('q.mergeWhy') && src.includes('结构未识别') && src.includes('showDirectoryPicker') && src.includes('已写入所选文件夹') && src.includes('r32(md,0)===0') && src.includes('数据块太长') && src.includes('new Blob(pieces') && src.includes('jm.size||jm.length') && src.includes('got.push(m)') && src.includes('正在下另一份') && src.includes('若页面卡住请点重试，重试会分开保存') && !src.includes('等待合并') && src.includes('streamOnly') && src.includes('不能同时放在页面里') && src.includes('下一份体积未知') && src.includes('asBlob=()=>blob||(blob=new Blob([e]') && src.includes('w.write(e)') && src.includes('noHold:!0') && src.includes('页面里留不住一整块') && src.includes('if(r&&r.noHold)r=r.blob') && src.includes('forceParts') && src.includes('o0.forceParts||heapTight') && src.includes('点重试会接着下') && src.includes('keepExistingData:!0') && src.includes('q.partialName') && src.includes('bilibili_helper_partial') && src.includes('m[qq0.partialName]') && src.includes('delete m[name]') && src.includes('f.size<o0.resumeFrom') && src.includes('spill.truncate') && src.includes('w.truncate') && src.includes('已有未下完的部分，请先选择文件夹再接着下') && src.includes('typeof globalThis.showDirectoryPicker!="function"') && src.includes('请先选择文件夹再重试') && src.includes('已按小块写入文件夹') && src.includes('streamed:!0') && src.includes('边下边写入文件夹') && src.includes('q.spillTo=') && src.includes('needDir:!0') && src.includes('请先选择文件夹再重试') && src.includes('q.epBlobs') && src.includes('qRel()') && src.includes('若没保存成功请再下一次') && src.includes('q.rel=qRel') && src.includes('n>0&&q.rel') && src.includes('usedJSHeapSize') && src.includes('页面已经比较满，先保存这一份再下另一份') && src.includes('heap.usedJSHeapSize+(n>0?heldBytes+nextBytes*2:0)>heap.jsHeapSizeLimit*0.7') && src.includes('heap2.usedJSHeapSize+reserve>heap2.jsHeapSizeLimit*0.7') && src.includes('合并时页面放不下，改为分开保存') && src.includes('q.noMerge[o]=1') && src.includes('这一集上次在页面里放不下，这次分开保存') && src.includes('bilibili_helper_nomerge') && src.includes('delete m0[o]') && src.includes('Invalid typed array length') && src.includes('合并内存不足，不再继续') && src.includes('replace(/^\\d{3}_/,"")') && src.includes('if(n>0&&!streamOnly){try{let k="bilibili_helper_nomerge"') && src.includes('localStorage.getItem("bilibili_helper_nomerge")') && src.includes('st.setItem(key,JSON.stringify(keep))') && src.includes('reserve>(q.holdMax||128*1024*1024)') && src.includes('reserve=heldNow*4') && src.includes('qSave(localStorage,k,m,o)') && src.includes('k!==name&&k!==bareName') && src.includes('bhnm"+i') && src.includes('=([^;]*)') && src.includes('length>1800') && src.includes('chunks.length>cap') && src.includes('x[0]!=="#"') && src.includes('qHash(o)') && src.includes('这次分开保存 - ') && src.includes('document.cookie="bhnmnow="') && src.includes('bhnmnow=([^;]*)') && src.includes('document.cookie="bhx"+id+"="') && src.includes('bhnmfull=1') && src.includes('记住的名单已经满了') && src.includes('let remembered=!!(quick||q.noMerge') && src.includes('qRead()') && src.includes('indexedDB.open("bilibili_helper_notes",1)') && src.includes('await qDbRead()') && src.includes('(await qDbWrite(list))?8:30') && src.includes('i<30') && src.includes('(heldBytes+nextBytes)*2>(q.holdMax||128*1024*1024)') && src.includes('再留一份合并结果会放不下') && src.includes('不再把两份放在一起') && src.includes('点重试会先请你选择文件夹') && src.includes('let sh=bxShown(N)') && src.includes('浏览器不报告剩余空间，这一份已经较大') && src.includes('q.holdMax||128*1024*1024') && src.includes('blindHold') && src.includes('Math.min(cap0,hold0)') && src.includes('Math.min(cap,hold)') && src.includes('asked||!(G&&(G.needDir||lostDir))') && src.includes('G.name==="NotAllowedError"') && src.includes('if(G&&G.name)err.name=G.name') && src.includes('N>mem0.jsHeapSizeLimit*0.1') && src.includes('(N||t)-1') && src.includes('两份加起来已经较大') && src.includes('点重试会重新下载后再分开保存') && src.includes('文件夹权限失效，点重试会重新选择')); // v3.0.46 认得出的普通mp4和分片mp4在页面里改写样本偏移后直接保存, 不把两份文件再拷进wasm(上限2GB)。认不出或超过1200MB则仍走原来的ffmpeg或分开保存
ok('A68 下载停滞自动续传(o0: 停滞计时断开+Range断点续传×5轮+403/404直抛+416重置)', src.includes('Range:"bytes="+t+"-"') && src.includes('下载停滞超过') && src.includes('att<5') && src.includes('u.size=u.byteLength') && src.includes('正在整理已下载的数据，请勿重试') && src.includes('t instanceof Uint8Array') && src.includes('G.st===403') && src.includes('G.st===416')); // v3.0.40 卡住(55%不动: 旧o0纯fetch+ReadableStream无停滞超时, TCP半死则l.read()永不resolve进度永冻; 改: 每块重置停滞计时(o0.stallMs默认20s, 秒数动态拼串), 超时cancel+抛错→Range续传, 服务端不支持206则回退全量重下, 403/404直抛不空转, 416重置偏移, 5轮耗尽才抛)

// ---- 报告 ----
const report = {
  generated_at: new Date().toISOString(),
  file: 'bilibili-helper-content-script.js',
  u1_line: lines.findIndex(l => l.includes('var U1=')) + 1,
  static: 'A1-A65见控制台',
  replay, season_replay: seasonReplay, scenarios: [c1, c2, c3, c4, c5, c6],
  live_note: 'live单发证据见evidence/live-nav-anon.json(匿名-101), evidence/live-top-arc.json(code0兜底可用), evidence/live-pn1-412.html(服务端IP冷却, 单发无重试), evidence/live-bx-expand.json(合集4集×多P实机展开324集)',
  pass: fail.length === 0
};
fs.writeFileSync('evidence/verify-report.json', JSON.stringify(report, null, 1) + '\n');
console.log('report: evidence/verify-report.json pass=' + report.pass);
if (fail.length) { console.log('FAILED: ' + fail.join(' | ')); process.exit(1); }
console.log('ALL VERIFY CHECKS PASS');
