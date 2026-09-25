// probe-partial.mjs — U1源码直跑探针(零网络mock, 短命令可复现):
//   node evidence/probe-partial.mjs
// 输出: 源码行号定位 + 全仓零字面计数 + U1特征位 + 归一分支原文 + -403/-401/-352直跑结果
import fs from 'node:fs';
const src = fs.readFileSync('bilibili-helper-content-script.js', 'utf8');
const lines = src.split('\n');
console.log('TOTAL=' + lines.length);
lines.forEach((l, i) => { if (l.includes('var U1=')) console.log('U1_IDX=' + (i + 1) + ' LEN=' + l.length); });
const c = (re) => (src.match(re) || []).length;
console.log('SRC-ZERO dash403=' + c(/-403/g) + ' dash401=' + c(/-401/g) + ' wbi=' + c(/wbi/gi) + ' mixin=' + c(/MIXIN/g) + ' deny=' + c(/访问权限不足/g));
const ui = src.indexOf('var U1='), uj = src.indexOf('o.partial=q;return o};') + 20;
const u1 = src.slice(ui, uj);
console.log('U1 arc=' + u1.includes('x/space/arc/search?mid=') + ' expected=' + u1.includes('o.expected=') + ' cacheTs=' + u1.includes('o.cacheTs=') + ' partial_q=' + u1.includes('q=!0') + ' coolkey=' + u1.includes('bilibili_helper_uplist_cool_') + ' t40=' + u1.includes('t>=40') + ' seen=' + u1.includes('seen=new Set') + ' no_throw=' + (u1.indexOf('throw') < 0) + ' no_login=' + (u1.indexOf('登录') < 0) + ' no_wbi=' + !/wbi/i.test(u1));
const i0 = u1.indexOf('if(!u||u.code!==E.OK){');
console.log('NORMALIZE_BLOCK_START=' + i0);
console.log(u1.slice(i0, i0 + 900));
const u1line = lines.find((l) => l.includes('var U1='));
const factory = new Function('bx0', 'bx2', 'V', 'E', 'window', 'esc', u1line + '; return U1;');
const bx2 = (ms) => Promise.resolve(), V = { credentials: 'include' }, E = { OK: 0 };
for (const code of [-403, -401, -352]) {
  let calls = 0;
  const ff = async (url) => { calls++; return { json: async () => ({ code: code, message: 'mock' }) }; };
  const fn = factory({ cancel: false }, bx2, V, E, { fetch: ff }, String);
  let res = null, threw = null;
  try { res = await fn(396395171, () => {}); } catch (e) { threw = String((e && e.message) || e); }
  console.log('CODE=' + code + ' len=' + (res ? res.length : -1) + ' partial=' + (res ? !!res.partial : null) + ' fetchCalls=' + calls + ' threw=' + threw);
}
