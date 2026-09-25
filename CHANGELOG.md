# Changelog

本项目遵循语义化版本。所有显著变更记录于此。

## [3.0.18] - 2026-09-25

### Changed（防风控重设计：首屏即 -799 场景）
- **pn1 双败 fast-fail**：列表第 1 页连续失败只重试 1 次（约 12s），再败即停，不再空转 4 次退避。
- **15min 冷却记忆**：pn1 双败后写 `bilibili_helper_uplist_cool_<mid>`，15 分钟内再次点击直接提示剩余时间、**零请求**（防“越点限得越久”）。
- **缓存 failover**：pn1 失败但有上次成功缓存时，自动用缓存（标 `partial`+缓存）继续下载；无缓存才提示稍候再试。
- **类人 pacing**：列表页间隔 1500–2300ms → 3500–5000ms 随机（证据：全量扫描 3474 paced 调用 risk=0）。
- 新增列表速度档“超稳 18s”；成功抓取即写 `bilibili_helper_uplist_<mid>` 缓存并清冷却。
- 中途分页 -799 仍保留递增退避 ≤4 次；单条目兜底禁回填、零抛错 partial、去重、上限语义全部保留。
- 替代桶实测结论（T1–T8）：space HTML 为 SPA 空壳、dynamic feed 需鉴权、series/search-type 报 -400、top/arc 仅 1 条——无可用第二完整列表桶，故不换接口，只做节奏+冷却+缓存。

### Verified
- `node --check` OK；`verify-u1-bxd.mjs` 32 项全绿（含新增 C5 冷却记忆场景：pn1 双败进冷却 + 二次零请求）；`acceptance.mjs` 16 项全绿。

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
