// live-collect.mjs — 冷却感知live取证循环(温和, 非暴力):
//   ATTEMPTS=4 GAP=840 node evidence/live-collect.mjs
// 每轮仅单发一次pn1探测; 仅当pn1返回code0时才运行全量walk(走U1自带pacing/退避);
// 收敛即停, 否则间隔GAP秒后下一轮。命中冷却/挑战码立即停等, 全程零抛错。
// 日志: evidence/live-collect.log; 成功时 live-walk-full.* 即为收敛落盘。
import fs from 'node:fs';
import { execSync } from 'node:child_process';
const ATTEMPTS = Number(process.env.ATTEMPTS || 4);
const GAP = Number(process.env.GAP || 840);
const H = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  'Referer': 'https://www.bilibili.com/',
  'Origin': 'https://www.bilibili.com'
};
const URL = 'https://api.bilibili.com/x/space/arc/search?mid=396395171&pn=1&ps=30&tid=0&keyword=&order=pubdate&jsonp=jsonp';
const log = (m) => { const s = new Date().toISOString() + ' ' + m; console.log(s); fs.appendFileSync('evidence/live-collect.log', s + '\n'); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let done = false;
for (let a = 1; a <= ATTEMPTS && !done; a++) {
  log(`ROUND ${a}/${ATTEMPTS} probe pn1 (single request)`);
  let code = 'FETCH_FAIL', http = 0;
  try {
    const r = await fetch(URL, { headers: H });
    http = r.status;
    const t = await r.text();
    try { code = JSON.parse(t).code; } catch (_) { code = 'HTML_' + http; }
  } catch (e) { code = 'THREW_' + String((e && e.message) || e); }
  log(`ROUND ${a} pn1 http=${http} code=${code}`);
  if (code === 0) {
    log(`ROUND ${a} pn1 OK -> full walk (U1 pacing/backoff)`);
    try { execSync('node evidence/live-walk.mjs', { stdio: 'inherit', timeout: 1500000 }); }
    catch (e) { log('walk exec error: ' + String((e && e.message) || e)); }
    try {
      const s = JSON.parse(fs.readFileSync('evidence/live-walk-full-summary.json', 'utf8'));
      log(`WALK RESULT got=${s.got} uniq=${s.uniq} expected=${s.total_count} partial=${s.partial} threw=${s.threw} converged=${s.converged}`);
      if (s.converged) { done = true; log('CONVERGED - stop'); }
    } catch (e) { log('summary read fail: ' + String((e && e.message) || e)); }
  }
  if (!done && a < ATTEMPTS) { log(`cooldown sleep ${GAP}s`); await sleep(GAP * 1000); }
}
log(done ? 'COLLECT DONE converged=true' : 'COLLECT DONE converged=false (IP challenged all rounds)');
