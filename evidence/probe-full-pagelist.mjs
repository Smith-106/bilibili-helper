// 全量 pagelist sweep：DOM 1158 全量逐集 pagelist(code0+cid)，GAP 4s，风险码即停。
// cid 即 bxD 批量下载链路的直接输入。
import fs from 'node:fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const H = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  'Referer': 'https://www.bilibili.com/',
  'Origin': 'https://www.bilibili.com'
};
const OFF = parseInt(process.argv[2] || '0', 10);
const CNT = parseInt(process.argv[3] || '150', 10);
const GAP = 4000;
const dom = fs.readFileSync('evidence/browser-all-bvids.txt', 'utf8').trim().split(/\n/);
const END = Math.min(OFF + CNT, dom.length);
let code0 = 0, risk = 0, threw = 0, noCid = 0;
let stopped = null;
for (let i = OFF; i < END; i++) {
  const bvid = dom[i];
  await sleep(GAP);
  let row;
  try {
    const r = await fetch('https://api.bilibili.com/x/player/pagelist?bvid=' + bvid + '&jsonp=jsonp', { headers: H });
    const t = await r.text();
    let j = null;
    try { j = JSON.parse(t); } catch { row = { i, bvid, code: 'HTML', http: r.status }; risk++; stopped = 'HTML_' + r.status + ' at ' + i; }
    if (!row) {
      const cid = j.data && j.data[0] && j.data[0].cid;
      const pages = j.data && j.data.length;
      if (j.code === 0 && cid) { code0++; row = { i, bvid, code: 0, cid, pages }; }
      else {
        row = { i, bvid, code: j.code, pages };
        if (j.code !== 0) {
          if ([-799, -352, -403, -401, -412].includes(j.code) || j.code === 412) { risk++; stopped = 'code_' + j.code + ' at ' + i; }
          else noCid++;
        } else noCid++;
      }
    }
  } catch (e) { threw++; row = { i, bvid, code: 'THROW', err: String(e).slice(0, 80) }; stopped = 'throw at ' + i; }
  fs.appendFileSync('evidence/full-pagelist-progress.jsonl', JSON.stringify(row) + '\n');
  if (stopped) break;
  if ((i - OFF + 1) % 25 === 0) console.log(`progress ${i + 1}/${dom.length} code0=${code0}`);
}
console.log(`CHUNK off=${OFF} end=${END} code0=${code0} risk=${risk} threw=${threw} noCid=${noCid} stopped=${stopped}`);
