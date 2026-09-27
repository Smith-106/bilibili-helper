// mod-parse-check.mjs — 主脚本按 module 语义解析(与浏览器 type=module 注入一致):
//   node --experimental-vm-modules evidence/mod-parse-check.mjs → exit 0 可解析 / exit 1 失败
// 背景: v3.0.21/v3.0.22 中 Dv 行模板字符串闭合符误写为双引号, node --check(经典脚本语义)
// historisch 通过但浏览器 module 解析整文件失败 → 扩展无面板。A26 引用本脚本防复发。
import fs from 'node:fs';
import vm from 'node:vm';
const src = fs.readFileSync('bilibili-helper-content-script.js', 'utf8');
try {
  new vm.SourceTextModule(src);
  console.log('MOD-PARSE-OK');
} catch (e) {
  console.log('MOD-PARSE-FAIL: ' + String((e && e.message) || e).slice(0, 150));
  process.exit(1);
}
