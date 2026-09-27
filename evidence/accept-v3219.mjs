// accept-v3219.mjs — v3.2.19 release资产单命令验收(仅读操作, 确定性):
//   node evidence/accept-v3219.mjs  →  exit 0 全过 / exit 1 任一失败
// 覆盖: release含4资产且命名符合规范 / latest.json版本+url+签名 / body非空 / 工作树干净无残留worktree
import { execSync } from 'node:child_process';
let bad = 0;
const ck = (name, cond, extra = '') => {
  console.log((cond ? 'V3219-OK ' : 'V3219-FAIL ') + name + (extra ? ' | ' + extra : ''));
  if (!cond) bad++;
};
const sh = (c) => execSync(c, { stdio: 'pipe' }).toString();
const rel = JSON.parse(sh('gh release view v3.2.19 --repo Smith-106/niko-buddy --json tagName,body,assets'));
ck('release tag', rel.tagName === 'v3.2.19');
const names = rel.assets.map((a) => a.name);
ck('asset exe', names.includes('niko-buddy_3.2.19_windows_X64.exe'));
ck('asset sig', names.includes('niko-buddy_3.2.19_windows_X64.exe.sig'));
ck('asset portable', names.includes('niko-buddy_3.2.19_windows_X64_portable.exe'));
ck('asset latest.json', names.includes('latest.json'));
ck('no legacy QMaiWrite assets', !names.some((n) => n.startsWith('QMaiWrite')));
const exe = rel.assets.find((a) => a.name === 'niko-buddy_3.2.19_windows_X64.exe');
ck('exe size sane', exe && exe.size > 30000000, 'size=' + (exe && exe.size));
ck('body 4 items', (rel.body || '').split('\n').filter(Boolean).length >= 4);
const latest = JSON.parse(sh('gh release download v3.2.19 --repo Smith-106/niko-buddy --pattern latest.json --output -'));
ck('latest version', latest.version === '3.2.19');
ck('latest url repo', (latest.platforms['windows-x86_64'].url || '').includes('Smith-106/niko-buddy/releases/download/v3.2.19/niko-buddy_3.2.19_windows_X64.exe'), latest.platforms['windows-x86_64'].url);
ck('latest signature', (latest.platforms['windows-x86_64'].signature || '').length > 100);
const wt = sh('git -C "../niko-hub/QMAI" worktree list');
ck('worktree v3219 removed', !wt.includes('v3219'));
const porc = sh('git status --porcelain').trim();
ck('worktree clean', porc === '', porc.slice(0, 100));
console.log(bad === 0 ? 'V3219-ALL-PASS' : `V3219-FAIL n=${bad}`);
process.exit(bad === 0 ? 0 : 1);
