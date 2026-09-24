// 全量 playurl sweep：DOM 1158 全量逐集 playurl(code0+quality+dash)，GAP 5s，JSON-only 零字节下载。
// -10403(VIP专属)为单集合法状态，记录不停；风控码(-799/-352/-403/-401/412/HTML)即停。
import fs from 'node:fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const H = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  'Referer': 'https://www.bilibili.com/',
  'Origin': 'https://www.bilibili.com'
};
const OFF = parseInt(process.argv[2] || '0', 10);
const CNT = parseInt(process.argv[3] || '150', 10);
const GAP = 5000;
const dom = fs.readFileSync('evidence/browser-all-bvids.txt', 'utf8').trim().split(/\n/);
const vmap = new Map(fs.readFileSync('evidence/full-view-progress.jsonl', 'utf8').trim().split(/\n/).map(l => { const r = JSON.parse(l); return [r.i, r.aid]; }));
const pmap = new Map();
for (const l of fs.readFileSync('evidence/full-pagelist-progress.jsonl', 'utf8').trim().split(/\n/)) {
  const r = JSON.parse(l);
  const cur = pmap.get(r.i);
  if (!cur || r.code === 0) pmap.set(r.i, r.cid);
}
const END = Math.min(OFF + CNT, dom.length);
let code0 = 0, vip = 0, risk = 0, threw = 0, other = 0;
let stopped = null;
for (let i = OFF; i < END; i++) {
  const bvid = dom[i];
  const aid = vmap.get(i), cid = pmap.get(i);
  await sleep(GAP);
  let row = { i, bvid };
  try {
    const r = await fetch(`https://api.bilibili.com/x/player/playurl?avid=${aid}&bvid=${bvid}&cid=${cid}&qn=64&fnver=0&fnval=4048&fourk=1`, { headers: H });
    const t = await r.text();
    let j = null;
    try { j = JSON.parse(t); } catch { row.code = 'HTML'; row.http = r.status; risk++; stopped = 'HTML_' + r.status + ' at ' + i; }
    if (!row.code && row.code !== 0) {
      const dash = j.data && j.data.dash;
      const hasDash = !!(dash && (Array.isArray(dash.video) ? dash.video.length : dash.video) && (Array.isArray(dash.audio) ? dash.audio.length : dash.audio));
      const durlLen = (j.data && j.data.durl && j.data.durl.length) || 0;
      row.code = j.code;
      row.q = j.data && j.data.quality;
      row.dash = hasDash;
      row.durl_len = durlLen;
      const downloadable = j.code === 0 && (hasDash || durlLen === 1);
      row.dl = downloadable;
      if (downloadable) code0++;
      else if (j.code === -10403) vip++;
      else if ([-799, -352, -403, -401, -412].includes(j.code) || j.code === 412) { risk++; stopped = 'code_' + j.code + ' at ' + i; }
      else other++;
    }
  } catch (e) { threw++; row.code = 'THROW'; row.err = String(e).slice(0, 80); stopped = 'throw at ' + i; }
  fs.appendFileSync('evidence/full-playurl-progress.jsonl', JSON.stringify(row) + '\n');
  if (stopped) break;
  if ((i - OFF + 1) % 25 === 0) console.log(`progress ${i + 1}/${dom.length} code0=${code0} vip=${vip} risk=${risk}`);
}
console.log(`CHUNK off=${OFF} end=${END} code0=${code0} vip=${vip} other=${other} risk=${risk} threw=${threw} stopped=${stopped}`);
