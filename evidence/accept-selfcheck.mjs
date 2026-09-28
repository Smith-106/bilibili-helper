// accept-selfcheck.mjs — v3.0.24 单命令自验收(零网络, 确定性):
//   node evidence/accept-selfcheck.mjs  →  exit 0 全过 / exit 1 任一失败
// 覆盖 Goal R1/R2/R3:
//   R1: 主脚本含 window.confirm + cached||partial 条件 + 取消停手复位分支 + H 自定义元素幂等(get判重+try/catch)
//   R2: node --check + mod-parse-check + verify-u1-bxd.mjs(42✓) + acceptance.mjs(16OK) + A24/A25/A26断言行
//   R3: manifest 3.0.24 + harness跑后还原verify-report(工作树干净由git负责)
import fs from 'node:fs';
import { execSync } from 'node:child_process';
let bad = 0;
const ck = (name, cond, extra = '') => {
  console.log((cond ? 'SELF-OK ' : 'SELF-FAIL ') + name + (extra ? ' | ' + extra : ''));
  if (!cond) bad++;
};
const src = fs.readFileSync('bilibili-helper-content-script.js', 'utf8');
// R1
ck('R1 confirm present once', (src.match(/window\.confirm/g) || []).length === 1);
ck('R1 cached||partial gate', src.includes('if((t.cached||t.partial)&&t.length)'));
ck('R1 cancel-stop text', src.includes('已取消：当前为') && src.includes('未开始下载'));
ck('R1 confirm fields', src.includes('window.confirm(`当前为') && src.includes('/ 缺') && src.includes('/ 缓存'));
ck('R1 H idempotent get-guard', src.includes('customElements.get(B)||') && src.includes('customElements.define(B'));
ck('R1 H try/catch', /H=e=>\{try\{e\.customElements/.test(src));
// R2a syntax
try { execSync('node --check bilibili-helper-content-script.js', { stdio: 'pipe' }); ck('R2 syntax CJS_OK', true); }
catch (e) { ck('R2 syntax CJS_OK', false, String((e && e.message) || e).slice(0, 120)); }
try { execSync('node --experimental-vm-modules evidence/mod-parse-check.mjs', { stdio: 'pipe' }); ck('R2 module MOD-PARSE-OK', true); }
catch (e) { ck('R2 module MOD-PARSE-OK', false, String((e && e.message) || e).slice(0, 120)); }
// R2b verify harness
try {
  const v = execSync('node evidence/verify-u1-bxd.mjs', { stdio: 'pipe' }).toString();
  const n = (v.match(/^✓/gm) || []).length;
  ck('R2 verify 46 pass', n === 46 && v.includes('ALL VERIFY CHECKS PASS'), `got=${n}`);
  ck('R2 A24 in log', v.includes("✓ A24 Dv缓存/部分二次确认"));
  ck('R2 A25 in log', v.includes("✓ A25 H自定义元素幂等"));
  ck('R2 A26 in log', v.includes("✓ A26 主脚本module语义可解析"));
  ck('R2 A27 in log', v.includes("✓ A27 失败一键重试"));
  ck('R2 A28 in log', v.includes("✓ A28 失败分类计数"));
  ck('R2 A29 in log', v.includes("✓ A29 开始行ETA预估"));
  ck('R2 A30 in log', v.includes("✓ A30 Dv缓存文案小时数"));
} catch (e) { ck('R2 verify 46 pass', false, 'exit!=0'); }
// R2c acceptance
try {
  const a = execSync('node evidence/acceptance.mjs', { stdio: 'pipe' }).toString();
  const n = (a.match(/^ACCEPT-OK/gm) || []).length;
  ck('R2 acceptance 16 pass', n === 16 && a.includes('ALL-ACCEPTANCE-PASS'), `got=${n}`);
} catch (e) { ck('R2 acceptance 16 pass', false, 'exit!=0'); }
// R2d A24 assertion in harness source
const h = fs.readFileSync('evidence/verify-u1-bxd.mjs', 'utf8');
ck('R2 A24 assertion source', h.includes("ok('A24 Dv缓存/部分二次确认"));
ck('R2 A25 assertion source', h.includes("ok('A25 H自定义元素幂等"));
ck('R2 A26 assertion source', h.includes("ok('A26 主脚本module语义可解析"));
ck('R2 A27 assertion source', h.includes("ok('A27 失败一键重试"));
ck('R2 A28 assertion source', h.includes("ok('A28 失败分类计数"));
ck('R2 A29 assertion source', h.includes("ok('A29 开始行ETA预估"));
ck('R2 A30 assertion source', h.includes("ok('A30 Dv缓存文案小时数"));
// R3 version sync
const mf = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
ck('R3 manifest 3.0.24', mf.version === '3.0.24', 'got=' + mf.version);
const rm = fs.readFileSync('README.md', 'utf8');
ck('R3 README 3.0.24', rm.includes('`3.0.24`'));
const cl = fs.readFileSync('CHANGELOG.md', 'utf8');
ck('R3 CHANGELOG 3.0.24', cl.includes('## [3.0.24]'));
// restore harness side-effect
try { execSync('git checkout -- evidence/verify-report.json', { stdio: 'pipe' }); } catch (_) {}
console.log(bad === 0 ? 'SELFCHECK-ALL-PASS' : `SELFCHECK-FAIL n=${bad}`);
process.exit(bad === 0 ? 0 : 1);
