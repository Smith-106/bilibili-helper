// 30集分层字节头证明:idx每40一集(0,40,...,1120)+尾1157,playurl JSON + Range 0-1023取video头(dash另取audio头),GAP 5s,风险码即停,零视频字节全量下载.
import fs from 'node:fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const H = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  'Referer': 'https://www.bilibili.com/',
  'Origin': 'https://www.bilibili.com'
};
const GAP = 5000;
const dom = fs.readFileSync('evidence/browser-all-bvids.txt', 'utf8').trim().split(/\n/);
const vmap = new Map(fs.readFileSync('evidence/full-view-progress.jsonl', 'utf8').trim().split(/\n/).map(l => { const r = JSON.parse(l); return [r.i, r.aid]; }));
const pmap = new Map();
for (const l of fs.readFileSync('evidence/full-pagelist-progress.jsonl', 'utf8').trim().split(/\n/)) {
  const r = JSON.parse(l);
  const cur = pmap.get(r.i);
  if (!cur || r.code === 0) pmap.set(r.i, r.cid);
}
const IDX = [];
for (let i = 0; i < 1158; i += 40) IDX.push(i);
if (IDX[IDX.length - 1] !== 1157) IDX.push(1157);
console.log('episodes=' + IDX.length + ' idx=' + IDX.join(','));
const rows = [];
let ok = 0, risk = 0, threw = 0;
let stopped = null;
for (const i of IDX) {
  const bvid = dom[i], aid = vmap.get(i), cid = pmap.get(i);
  await sleep(GAP);
  const row = { idx: i, bvid };
  try {
    const pj = await (await fetch(`https://api.bilibili.com/x/player/playurl?avid=${aid}&bvid=${bvid}&cid=${cid}&qn=64&fnver=0&fnval=4048&fourk=1`, { headers: H })).json();
    row.playurl_code = pj.code;
    row.q = pj.data && pj.data.quality;
    if ([-799, -352, -403, -401, -412].includes(pj.code) || pj.code === 412) { risk++; stopped = 'playurl code_' + pj.code + ' at ' + i; rows.push(row); break; }
    if (pj.code !== 0) { row.note = 'nonzero-skip-bytes'; rows.push(row); continue; }
    const dash = pj.data && pj.data.dash;
    const hasDash = !!(dash && dash.video && dash.video.length && dash.audio && dash.audio.length);
    let vurl, aurl;
    if (hasDash) { vurl = (dash.video[0].baseUrl || (dash.video[0].backupUrl && dash.video[0].backupUrl[0])); aurl = (dash.audio[0].baseUrl || (dash.audio[0].backupUrl && dash.audio[0].backupUrl[0])); row.branch = 'dash'; }
    else if (pj.data && pj.data.durl && pj.data.durl.length === 1) { vurl = pj.data.durl[0].url; row.branch = 'durl1'; }
    else { row.note = 'no-url-branch'; rows.push(row); continue; }
    await sleep(3000);
    const vh = await fetch(vurl, { headers: { ...H, 'Range': 'bytes=0-1023' } });
    const vb = await vh.arrayBuffer();
    row.vh = { http: vh.status, bytes: vb.byteLength };
    if (aurl) {
      await sleep(3000);
      const ah = await fetch(aurl, { headers: { ...H, 'Range': 'bytes=0-1023' } });
      const ab = await ah.arrayBuffer();
      row.ah = { http: ah.status, bytes: ab.byteLength };
    }
    if (row.vh.http === 206 && row.vh.bytes === 1024 && (!row.ah || (row.ah.http === 206 && row.ah.bytes === 1024))) { ok++; row.ok = true; }
    else row.ok = false;
  } catch (e) { threw++; row.err = String(e).slice(0, 80); stopped = 'throw at ' + i; rows.push(row); break; }
  rows.push(row);
  console.log(`idx=${i} ${bvid} code=${row.playurl_code} branch=${row.branch} vh=${row.vh && row.vh.http}/${row.vh && row.vh.bytes} ok=${!!row.ok}`);
}
const out = { generated_at: new Date().toISOString(), mid: 396395171, episodes: IDX.length, ok, risk_hits: risk, threw, stopped, all_ok: ok === IDX.length, pacing: 'playurl 5s + range-head 3s, bytes 0-1023 only', rows };
fs.writeFileSync('evidence/live-byte30-summary.json', JSON.stringify(out, null, 1) + '\n');
console.log(`DONE episodes=${IDX.length} ok=${ok} risk=${risk} threw=${threw} stopped=${stopped}`);
