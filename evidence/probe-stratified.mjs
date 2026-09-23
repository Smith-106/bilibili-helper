// 分层抽样下载链路探针：DOM 1158 全量按序分层取样，逐集 view+pagelist，全子集 playurl+Range-206。
// pacing: 每调用间隔 5s；Range 仅 0-1023（每集约2KB），零风控设计。
import fs from 'node:fs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const H = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
  'Referer': 'https://www.bilibili.com/',
  'Origin': 'https://www.bilibili.com'
};
const GAP = 5000;
const dom = fs.readFileSync('evidence/browser-all-bvids.txt', 'utf8').trim().split(/\n/);
const IDX = [0, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1157];
const PLAYURL_IDX = new Set([0, 300, 500, 700, 900, 1157]);
const rows = [];
let calls = 0;
const get = async (url, headers = H) => { calls++; await sleep(GAP); const r = await fetch(url, { headers }); return r; };
for (const i of IDX) {
  const bvid = dom[i];
  const row = { idx: i, bvid };
  try {
    const v = await (await get(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`)).json();
    row.view_code = v.code;
    row.aid = v.data && v.data.aid;
    row.pages = v.data && v.data.pages && v.data.pages.length;
    if (v.code !== 0) { row.ok = false; row.fail = 'view_code=' + v.code; rows.push(row); continue; }
    const pg = await (await get(`https://api.bilibili.com/x/player/pagelist?bvid=${bvid}&jsonp=jsonp`)).json();
    row.pagelist_code = pg.code;
    row.cid = pg.data && pg.data[0] && pg.data[0].cid;
    if (pg.code !== 0 || !row.cid) { row.ok = false; row.fail = 'pagelist'; rows.push(row); continue; }
    if (PLAYURL_IDX.has(i)) {
      const aid = row.aid, cid = row.cid;
      const p = await (await get(`https://api.bilibili.com/x/player/playurl?avid=${aid}&bvid=${bvid}&cid=${cid}&qn=64&fnver=0&fnval=4048&fourk=1`)).json();
      row.playurl_code = p.code;
      const dash = p.data && p.data.dash;
      row.dash = !!(dash && dash.video && dash.audio);
      row.quality = p.data && p.data.quality;
      if (p.code === 0 && row.dash) {
        const rh = { 'User-Agent': H['User-Agent'], 'Referer': 'https://www.bilibili.com/', 'Range': 'bytes=0-1023' };
        const vv = Array.isArray(dash.video) ? dash.video[0] : dash.video;
        const aa = Array.isArray(dash.audio) ? dash.audio[0] : dash.audio;
        const vurl = vv.baseUrl || vv.base_url || (vv.backupUrl && vv.backupUrl[0]) || (vv.backup_url && vv.backup_url[0]);
        const aurl = aa.baseUrl || aa.base_url || (aa.backupUrl && aa.backupUrl[0]) || (aa.backup_url && aa.backup_url[0]);
        const vh = await get(vurl, rh);
        row.video_head = { http: vh.status, bytes: parseInt(vh.headers.get('content-length') || '-1', 10) };
        await vh.arrayBuffer().catch(() => {});
        const ah = await get(aurl, rh);
        row.audio_head = { http: ah.status, bytes: parseInt(ah.headers.get('content-length') || '-1', 10) };
        await ah.arrayBuffer().catch(() => {});
      }
      row.ok = row.playurl_code === 0 && row.dash && row.video_head?.http === 206 && row.audio_head?.http === 206;
    } else {
      row.ok = true;
    }
  } catch (e) { row.ok = false; row.fail = 'throw:' + String(e).slice(0, 100); }
  rows.push(row);
  console.log(`idx=${i} bvid=${bvid} ok=${row.ok} view=${row.view_code} pg=${row.pagelist_code} pu=${row.playurl_code ?? '-'} vh=${row.video_head?.http ?? '-'} ah=${row.audio_head?.http ?? '-'}`);
}
const okRows = rows.filter(r => r.ok);
const out = {
  generated_at: new Date().toISOString(),
  mid: 396395171,
  dom_total: dom.length,
  sampled: rows.length,
  idx_list: IDX,
  ok_count: okRows.length,
  all_ok: okRows.length === rows.length,
  view_code0: rows.filter(r => r.view_code === 0).length,
  pagelist_code0: rows.filter(r => r.pagelist_code === 0).length,
  playurl_subset: rows.filter(r => PLAYURL_IDX.has(r.idx)).map(r => ({ idx: r.idx, bvid: r.bvid, code: r.playurl_code, q: r.quality, dash: r.dash, vh: r.video_head, ah: r.audio_head, ok: r.ok })),
  pacing: 'api 5s/call, range 0-1023 only',
  calls,
  rows
};
fs.writeFileSync('evidence/live-stratified-chain.json', JSON.stringify(out, null, 1) + '\n');
console.log(`DONE ok=${out.ok_count}/${out.sampled} calls=${calls}`);
