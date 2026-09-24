# Changelog

本项目遵循语义化版本。所有显著变更记录于此。

## [3.0.17] - 2026-09-24

### Fixed
- **批量下载「-799 后只下 1 集」bug**：UP 主全部视频批量下载时，`x/space/arc/search` 命中 `-799 请求过于频繁` 后，原逻辑消耗单次 5–7s 退避便落入 `x/space/top/arc` 兜底；该接口只返回置顶 1 条视频，导致批量任务坍缩为 1 集。现改为：
  - `-799`/网络异常 → **有界递增退避**（最多 4 次，约 12/16/20/24/27s）后继续分页；
  - 退避耗尽后按已抓页返回 `partial` 或空列表；
  - **移除 `top/arc` 单条目兜底进入批量列表**，杜绝单集坍缩。

### Changed
- 保留全部风控规避语义（R3）：分页 1500–2300ms 间隔、`t>=40` 上限、`bvid` 去重、零抛错 partial 降级、批量段 delay+jitter+连续失败冷却+持久化。

### Chore
- 仓库清理：移除 `_metadata/` 签名残留、maestro 运行时目录（`.workflow/`）、`.pi/` 注入文件与页面快照；加固 `.gitignore`。
- 新增 `README.md` / `CHANGELOG.md` / `docs/` 文档站。

### Verified
- `node --check bilibili-helper-content-script.js` → exit 0
- `node evidence/verify-u1-bxd.mjs` → 28/28 PASS（A1–A20 静态 / B1–B5 重放 1159 / C×4 预算场景）
- `node evidence/acceptance.mjs` → 16/16 ALL-ACCEPTANCE-PASS

## [3.0.16] - 2026-09-23

- 移除 wbi 签名依赖（legacy `x/space/arc/search` + `x/player/playurl`），匿名可用；
- U1 列表腿零抛错、无条件 partial 降级；
- 消除 `-403`/`-401`/`访问权限不足` 字面量与登录依赖语义；
- 引入 `evidence/` 可复跑证据与验收门。
