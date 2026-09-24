# 验证与证据

仓库内置**零网络、确定性**验证门，任何人可本地复跑。

## 三条命令

```bash
node --check bilibili-helper-content-script.js   # 语法
node evidence/verify-u1-bxd.mjs                  # 28 项 harness
node evidence/acceptance.mjs                     # 16 项验收门
```

## harness 覆盖（verify-u1-bxd.mjs）

- **A1–A20 静态**：U1 走 legacy `arc/search`、零 wbi / 零 throw / 零登录语义、fetch 预算=1、页间隔 1500–2300ms、递增退避、上限、去重、`top/arc` 兜底已移除、bxD 节奏/冷却/持久化。
- **B1–B5 重放**：以 `evidence/up-list-pn1.json` 真实 30 条逐字节为第 1 页，确定性派生至 39 页 → 收敛 **1159/1159** 非 partial、零 wbi、页间隔合规。
- **C×4 预算场景**：中途 `-352`→120 条 partial；首屏 `-403`→空 partial；首屏网络异常→退避 4 次空 partial；`-799` 两次后恢复→全量 1159。全部零抛错、fetch 有界。

## acceptance.mjs（16 项）

- **R1 四腿**：view / pagelist / playurl / byte 各 **1158/1158**，risk=0。
- **R2**：`wbi`/`-403`/`-401`/`访问权限不足` 静态计数=0；`pn1 code=0 count=1159`；`top code=0`。
- **R3**：`live-code-inventory` 分离——`code0=4674`/`HTTP_206=1164`/`-799×1`/`412×2`/`transient×3`（出口配额，均已退避恢复）。

## 证据目录（`evidence/`）

`full-*-progress.jsonl`（四条腿逐条记录）+ `live-full-*-summary.json`（汇总）+ `verify-*.json` + `r3-semantics.json` + 探针脚本（`probe-*.mjs`）。完整清单见 `evidence/live-code-inventory.json`。

[← 返回文档首页](./index.md)
