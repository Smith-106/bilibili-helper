// accept-selfcheck.mjs — v3.0.38 单命令自验收(零网络, 确定性):
//   node evidence/accept-selfcheck.mjs  →  exit 0 全过 / exit 1 任一失败
// 覆盖 Goal R1/R2/R3:
//   R1: 主脚本含 window.confirm + cached||partial 条件 + 取消停手复位分支 + H 自定义元素幂等(get判重+try/catch)
//   R2: node --check + mod-parse-check + verify-u1-bxd.mjs(92✓, 含D1-D2仿真门+A66) + acceptance.mjs(16OK) + A24–A66/B6–B13/D1–D2断言行
//   R3: manifest 3.0.38 + harness跑后还原verify-report(工作树干净由git负责)
import fs from 'node:fs';
import { execSync } from 'node:child_process';
let bad = 0;
const ck = (name, cond, extra = '') => {
  console.log((cond ? 'SELF-OK ' : 'SELF-FAIL ') + name + (extra ? ' | ' + extra : ''));
  if (!cond) bad++;
};
const src = fs.readFileSync('bilibili-helper-content-script.js', 'utf8');
// v3.0.37 新增断言清单(verify 日志与 harness 源码双侧核对)
const NEW = [
  'A58 合集分集按分P展开', 'A59 分集取不到pages时留chk标记', 'A60 下载腿pagelist改为展开全分P',
  'A61 分P命名', 'A62 按钮文案区分集数与分P数', 'A63 旧「合集只取每集首P」映射已移除',
  'A64 cid解析/多P展开先于行渲染', 'A65 分P列表失败带接口码',
  'B6 合集4集×多P展开324集', 'B7 每集都出全', 'B8 分P命名=视频标题', 'B9 按钮文案数据源seasonEps',
  'B10 无合集单视频多P回退仍为90P', 'B11 分集无pages且无avl', 'B12 分集无pages时走availableVideoList',
  'B13 普通合集(4集各单P)仍为4集不误伤',
  'D1 sim全过', 'D2 分P列表失败也必须有行', 'A66 批量行结构化',
];
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
  ck('R2 verify 92 pass', n === 92 && v.includes('ALL VERIFY CHECKS PASS'), `got=${n}`);
  ck('R2 A24 in log', v.includes("✓ A24 Dv缓存/部分二次确认"));
  ck('R2 A25 in log', v.includes("✓ A25 H自定义元素幂等"));
  ck('R2 A26 in log', v.includes("✓ A26 主脚本module语义可解析"));
  ck('R2 A27 in log', v.includes("✓ A27 失败一键重试"));
  ck('R2 A28 in log', v.includes("✓ A28 失败分类计数"));
  ck('R2 A29 in log', v.includes("✓ A29 开始行ETA预估"));
  ck('R2 A30 in log', v.includes("✓ A30 Dv缓存文案小时数"));
  ck('R2 A31 in log', v.includes("✓ A31 bxD结尾复位up-btn"));
  ck('R2 A32 in log', v.includes("✓ A32 bxD开头running守护"));
  ck('R2 A33 in log', v.includes("✓ A33 正在处理行剩余ETA"));
  ck('R2 A34 in log', v.includes("✓ A34 skip计数"));
  ck('R2 A35 in log', v.includes("✓ A35 UP主关键词筛选"));
  ck('R2 A36 in log', v.includes("✓ A36 下载腿受限计数"));
  ck('R2 A37 in log', v.includes("✓ A37 下载腿连续受限原地冷却"));
  ck('R2 A38 in log', v.includes("✓ A38 受限即时拉长集间"));
  ck('R2 A39 in log', v.includes("✓ A39 UI卡片化"));
  ck('R2 A40 in log', v.includes("✓ A40 可中断等待bx2c"));
  ck('R2 A41 in log', v.includes("✓ A41 原地冷却倒计时"));
  ck('R2 A42 in log', v.includes("✓ A42 集间等待前status提示"));
  ck('R2 A43 in log', v.includes("✓ A43 取消按钮即时disable"));
  ck('R2 A44 in log', v.includes("✓ A44 当前集行b-cur脉动高亮"));
  ck('R2 A45 in log', v.includes("✓ A45 结束行耗时统计"));
  ck('R2 A46 in log', v.includes("✓ A46 progress自动跟随近底"));
  ck('R2 A47 in log', v.includes("✓ A47 多P视频Bx展开"));
  ck('R2 A48 in log', v.includes("✓ A48 多P批量键mp"));
  ck('R2 A49 in log', v.includes("✓ A49 Dx空列表写UI状态行"));
  ck("R2 A50 in log", v.includes("✓ A50 batch-clear绑定守护"));
  ck("R2 A51 in log", v.includes("✓ A51 dash video-only降级"));
  ck("R2 A52 in log", v.includes("✓ A52 出错了message空兜底"));
  ck("R2 A53 in log", v.includes("✓ A53 d0 playurl空data判定"));
  ck("R2 A54 in log", v.includes("✓ A54 U空链接改INVALID_RESPONSE"));
  ck("R2 A55 in log", v.includes("✓ A55 support_formats可选"));
  ck("R2 A56 in log", v.includes("✓ A56 UI精简"));
  ck("R2 A57 in log", v.includes("✓ A57 side-bar移除main撑满"));
  // v3.0.37 多P展开链(合集分集逐分P展开 + 真实状态重放)
  NEW.forEach(l => ck('R2 ' + l.split(' ')[0] + ' in log', v.includes('✓ ' + l)));
} catch (e) { ck('R2 verify 92 pass', false, 'exit!=0'); }
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
ck('R2 A31 assertion source', h.includes("ok('A31 bxD结尾复位up-btn"));
ck('R2 A32 assertion source', h.includes("ok('A32 bxD开头running守护"));
ck('R2 A33 assertion source', h.includes("ok('A33 正在处理行剩余ETA"));
ck('R2 A34 assertion source', h.includes("ok('A34 skip计数"));
ck('R2 A35 assertion source', h.includes("ok('A35 UP主关键词筛选"));
ck('R2 A36 assertion source', h.includes("ok('A36 下载腿受限计数"));
ck('R2 A37 assertion source', h.includes("ok('A37 下载腿连续受限原地冷却"));
ck('R2 A38 assertion source', h.includes("ok('A38 受限即时拉长集间"));
ck('R2 A39 assertion source', h.includes("ok('A39 UI卡片化"));
ck('R2 A40 assertion source', h.includes("ok('A40 可中断等待bx2c"));
ck('R2 A41 assertion source', h.includes("ok('A41 原地冷却倒计时"));
ck('R2 A42 assertion source', h.includes("ok('A42 集间等待前status提示"));
ck('R2 A43 assertion source', h.includes("ok('A43 取消按钮即时disable"));
ck('R2 A44 assertion source', h.includes("ok('A44 当前集行b-cur脉动高亮"));
ck('R2 A45 assertion source', h.includes("ok('A45 结束行耗时统计"));
ck('R2 A46 assertion source', h.includes("ok('A46 progress自动跟随近底"));
ck('R2 A47 assertion source', h.includes("ok('A47 多P视频Bx展开"));
ck('R2 A48 assertion source', h.includes("ok('A48 多P批量键mp"));
ck('R2 A49 assertion source', h.includes("ok('A49 Dx空列表写UI状态行"));
ck("R2 A50 assertion source", h.includes("ok('A50 batch-clear绑定守护"));
ck("R2 A51 assertion source", h.includes("ok('A51 dash video-only降级"));
ck("R2 A52 assertion source", h.includes("ok('A52 出错了message空兜底"));
ck("R2 A53 assertion source", h.includes("ok('A53 d0 playurl空data判定"));
ck("R2 A54 assertion source", h.includes("ok('A54 U空链接改INVALID_RESPONSE"));
ck("R2 A55 assertion source", h.includes("ok('A55 support_formats可选"));
ck("R2 A56 assertion source", h.includes("ok('A56 UI精简"));
ck("R2 A57 assertion source", h.includes("ok('A57 side-bar移除main撑满"));
NEW.forEach(l => ck('R2 ' + l.split(' ')[0] + ' assertion source', h.includes("ok('" + l)));
// R3 version sync
const mf = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
ck('R3 manifest 3.0.38', mf.version === '3.0.38', 'got=' + mf.version);
const rm = fs.readFileSync('README.md', 'utf8');
ck('R3 README 3.0.38', rm.includes('`3.0.38`'));
const cl = fs.readFileSync('CHANGELOG.md', 'utf8');
ck('R3 CHANGELOG 3.0.38', cl.includes('## [3.0.38]'));
// restore harness side-effect
try { execSync('git checkout -- evidence/verify-report.json', { stdio: 'pipe' }); } catch (_) {}
console.log(bad === 0 ? 'SELFCHECK-ALL-PASS' : `SELFCHECK-FAIL n=${bad}`);
process.exit(bad === 0 ? 0 : 1);
