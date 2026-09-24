// 全量视频头 sweep:DOM 1158 全量逐集 playurl(JSON)+Range 0-1023 视频头(1KB),GAP playurl前5s/range前3s,风险码即停.
// 只取视频头(音频头已在 byte30/stratified/batch 证明),零视频全量字节,磁盘约1MB.
import fs from 'node:fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const H = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  'Referer': 'https://www.bilibili.com/',
  'Origin': 'https://www.bilibili.com'
};
const OFF = parseInt(process.argv[2] || '0', 10);
const CNT = parseInt(process.argv[3] || '80', 10);
const dom = fs.readFileSync('evidence/browser-all-bvids.txt', 'utf8').trim().split(/\n/);
const vmap = new Map(fs.readFileSync('evidence/full-view-progress.jsonl', 'utf8').trim().split(/\n/).map(l => { const r = JSON.parse(l); return [r.i, r.aid]; }));
const pmap = new Map();
for (const l of fs.readFileSync('evidence/full-pagelist-progress.jsonl', 'utf8').trim().split(/\n/)) {
  const r = JSON.parse(l);
  const cur = pmap.get(r.i);
  if (!cur || r.code === 0) pmap.set(r.i, r.cid);
}
const END = Math.min(OFF + CNT, dom.length);
let ok = 0, risk = 0, threw = 0, other = 0;
let stopped = null;
for (let i = OFF; i < END; i++) {
  const bvid = dom[i], aid = vmap.get(i), cid = pmap.get(i);
  await sleep(5000);
  let row = { i, bvid };
  try {
    const pj = await (await fetch(`https://api.bilibili.com/x/player/playurl?avid=${aid}&bvid=${bvid}&cid=${cid}&qn=64&fnver=0&fnval=4048&fourk=1`, { headers: H })).json();
    row.code = pj.code;
    if ([-799, -352, -403, -401, -412].includes(pj.code) || pj.code === 412) { risk++; stopped = 'playurl_' + pj.code + ' at ' + i; }
    else if (pj.code !== 0) { other++; row.note = 'playurl-nonzero'; }
    else {
      const dash = pj.data && pj.data.dash;
      const hasDash = !!(dash && dash.video && dash.video.length && dash.audio && dash.audio.length);
      let vurl;
      if (hasDash) { vurl = (dash.video[0].baseUrl || (dash.video[0].backupUrl && dash.video[0].backupUrl[0])); row.branch = 'dash'; }
      else if (pj.data && pj.data.durl && pj.data.durl.length === 1) { vurl = pj.data.durl[0].url; row.branch = 'durl1'; }
      else { other++; row.note = 'no-url-branch'; }
      if (vurl) {
        await sleep(3000);
        const vh = await fetch(vurl, { headers: { ...H, 'Range': 'bytes=0-1023' } });
        const vb = await vh.arrayBuffer();
        row.vh = { http: vh.status, bytes: vb.byteLength };
        if (vh.status === 206 && vb.byteLength === 1024) { ok++; row.ok = true; }
        else { other++; row.ok = false; }
      }
    }
  } catch (e) { threw++; row.err = String(e).slice(0, 80); stopped = 'throw at ' + i; }
  fs.appendFileSync('evidence/full-byte-progress.jsonl', JSON.stringify(row) + '\n');
  if (stopped) break;
  if ((i - OFF + 1) % 20 === 0) console.log(`progress ${i + 1}/${dom.length} ok=${ok} risk=${risk}`);
}
console.log(`CHUNK off=${OFF} end=${END} ok=${ok} other=${other} risk=${risk} threw=${threw} stopped=${stopped}`);
