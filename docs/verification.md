# 验证与证据

仓库内置**零网络、确定性**验证门，任何人可本地复跑。

## 三条命令

```bash
node --check bilibili-helper-content-script.js   # 语法
node evidence/verify-u1-bxd.mjs                  # 39 项 harness
node evidence/acceptance.mjs                     # 16 项验收门
```

## harness 覆盖（verify-u1-bxd.mjs）

- **A1–A23 静态**：U1 走 legacy `arc/search`、零 wbi / 零 throw / 零登录语义、fetch 预算=1、档位联动页间隔 + 起步 settle、pn1 双败 fast-fail + 15min 冷却记忆、中途加长退避 + 自适应放慢、缓存 failover、上限 40 页、去重、`top/arc` 兜底已移除、bxD 节奏/冷却/持久化、逐集 cid 经 pagelist、**U1 回传 `expected`+`cacheTs`**、**常驻完整性条 `bx8`+`#up-integrity`+重抓按钮**、**Dv 落盘 `lastUplist` 并重渲染**。
- **B1–B5 重放**：以 `evidence/up-list-pn1.json` 真实 30 条逐字节为第 1 页，确定性派生至 39 页 → 收敛 **1159/1159** 非 partial、零 wbi、页间隔合规。
- **C×6 预算场景**：中途 `-352`→120 条 partial；首屏 `-403`→空 partial；首屏网络异常→pn1 双败 fast-fail 进冷却；`-799` 一次后恢复→全量 1159；pn1 双败 `-799` 进冷却 + 二次零请求；中途 pn3 `-799` 两次后恢复→增量继续全量。全部零抛错、fetch 有界。
- **E1–E3 完整性字段**：全量 `expected==count` 且 `cacheTs>0`；部分 `expected==count` 且缺数正确；冷却 `expected==0` 且 `cool` 标记。

## acceptance.mjs（16 项）

- **R1 四腿**：view / pagelist / playurl / byte 各 **1158/1158**，risk=0。
- **R2**：`wbi`/`-403`/`-401`/`访问权限不足` 静态计数=0；`pn1 code=0 count=1159`；`top code=0`。
- **R3**：`live-code-inventory` 分离——`code0=4674`/`HTTP_206=1164`/`-799×1`/`412×2`/`transient×3`（出口配额，均已退避恢复）。

## 证据目录（`evidence/`）

`full-*-progress.jsonl`（四条腿逐条记录）+ `live-full-*-summary.json`（汇总）+ `verify-*.json` + `r3-semantics.json` + 探针脚本（`probe-*.mjs`）。完整清单见 `evidence/live-code-inventory.json`。

[← 返回文档首页](./index.md)
