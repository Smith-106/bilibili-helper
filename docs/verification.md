# 验证与证据

仓库内置**零网络、确定性**验证门，任何人可本地复跑。

## 三条命令

```bash
node --check bilibili-helper-content-script.js   # 语法
node evidence/verify-u1-bxd.mjs                  # 62 项 harness
node evidence/acceptance.mjs                     # 16 项验收门
```

## harness 覆盖（verify-u1-bxd.mjs）

- **A1–A46 静态**：U1 走 legacy `arc/search`、零 wbi / 零 throw / 零登录语义、fetch 预算=1、档位联动页间隔 + 起步 settle、pn1 双败 fast-fail + 15min 冷却记忆、中途加长退避 + 自适应放慢、缓存 failover、上限 40 页、去重、`top/arc` 兜底已移除、bxD 节奏/冷却/持久化、逐集 cid 经 pagelist、**U1 回传 `expected`+`cacheTs`**、**常驻完整性条 `bx8`+`#up-integrity`+重抓按钮**、**Dv 落盘 `lastUplist` 并重渲染**、**Dv 缓存/部分 `confirm` 二次确认**、**H 自定义元素幂等（`get` 判重 + try/catch，防二次 define 无面板）**、**主脚本 module 语义可解析（`mod-parse-check.mjs`，防模板闭合符误写致整文件无面板）**、**失败一键重试（`failItems`+重试按钮，仅重跑失败项）**、**失败分类计数（需会员/登录 vs 其他）**、**开始行 ETA 预估**、**Dv 缓存文案小时数**、**bxD 结尾复位 up-btn（修永久禁用）**、**bxD running 并发守护**、**正在处理行剩余 ETA**、**skip 计数（已有 N 集）**、**UP 主关键词筛选（`up-kw` + `keyword=` 服务端筛选 + 缓存 key 隔离）**、**下载腿受限计数（th）**、**连续受限原地冷却 5 分钟继续**、**受限即时拉长集间（wt×(1+th×2)）**、**UI 卡片化/批量进度滚动/成败底色/收起态 toggle**、**可中断等待 bx2c**、**原地冷却倒计时可取消**、**集间等待前 status 提示**、**当前集 b-cur 高亮**、**取消按钮防连点**、**结束行耗时**、**progress 近底自动跟随**。
- **B1–B5 重放**：以 `evidence/up-list-pn1.json` 真实 30 条逐字节为第 1 页，确定性派生至 39 页 → 收敛 **1159/1159** 非 partial、零 wbi、页间隔合规。
- **C×6 预算场景**：中途 `-352`→120 条 partial；首屏 `-403`→空 partial；首屏网络异常→pn1 双败 fast-fail 进冷却；`-799` 一次后恢复→全量 1159；pn1 双败 `-799` 进冷却 + 二次零请求；中途 pn3 `-799` 两次后恢复→增量继续全量。全部零抛错、fetch 有界。
- **E1–E3 完整性字段**：全量 `expected==count` 且 `cacheTs>0`；部分 `expected==count` 且缺数正确；冷却 `expected==0` 且 `cool` 标记。

## acceptance.mjs（16 项）

- **R1 四腿**：view / pagelist / playurl / byte 各 **1158/1158**，risk=0。
- **R2**：`wbi`/`-403`/`-401`/`访问权限不足` 静态计数=0；`pn1 code=0 count=1159`；`top code=0`。
- **R3**：`live-code-inventory` 分离——`code0=4674`/`HTTP_206=1164`/`-799×1`/`412×2`/`transient×3`（出口配额，均已退避恢复）。

## 证据目录（`evidence/`）

`full-*-progress.jsonl`（四条腿逐条记录，**被 `acceptance.mjs` 活引用为数据源，勿删**）+ `live-full-*-summary.json`（汇总）+ `verify-*.json` + `r3-semantics.json` + 探针脚本（`probe-*.mjs`）。完整清单见 `evidence/live-code-inventory.json`。

已清理冗余（v3.0.30 后）：`browser-p01.txt`（被 `browser-all-bvids.txt` 覆盖）、`status-ascii.txt`（v3.0.16 一次性快照）、`live-collect.log`（运行时生成，`*.log` 已 ignore）。

[← 返回文档首页](./index.md)
