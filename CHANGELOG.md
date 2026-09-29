# Changelog

本项目遵循语义化版本。所有显著变更记录于此。

## [3.0.31] - 2026-09-29

### Added（多 P 视频批量下载）
- **`Bx` 增补多 P fallback**：无 `ugc_season` 合集时，若 `videoData.videos>1`（多 P 视频/课程页），用 `videoData.pages[]` 构造批量列表（每 P 一集，`title=分P名`，`cid` 独立）。修复此前此类页 `Bx()` 返回 `[]` → 「未找到合集信息」的缺口。
- **批量键 `mp-<bvid>`**：多 P 列表用 `mp-<bvid>` 作 resume/done/cool 键（与合集 `season_id`、UP 主 `up<mid>` 隔离互不干扰）。
- **按钮文案自适应**：多 P 页批量按钮显示「批量下载本视频全部P（共 N P）」，合集页仍显示「批量下载合集（共 N 集）」。
- `batch-clear` / `bx5(P)` resume 计数同步识别 `mp-` 键。

### Verified
- `node --check` OK + `mod-parse-check` OK；真实页源码模拟 `Bx()` 返回 12 集（BV1Mjt96uE44 12 P 课程页）；`verify-u1-bxd.mjs` 64 项全绿（新增 A47–A48）；`acceptance.mjs` 16 项全绿。

## [3.0.30] - 2026-09-28

### Improved（UI 反馈：当前集定位、取消防连点、结束耗时、列表自动跟随）
- **当前集行脉动高亮**：正在处理的集行加 `.b-cur` 浅蓝底 + 左侧色条 + 1.6s 脉动动画，千集列表中一眼定位当前集；完成/失败后自动移除。
- **取消按钮防连点**：点「取消」立即 `disabled`，结束后复位，避免等待中重复点击的困惑。
- **结束行耗时统计**：`全部完成：成功N 跳过M 失败K（…，用时X分Y秒）`，与 ETA 对照可见实际耗时。
- **进度列表自动跟随**：当用户已滚到底部时新增集行自动贴底跟随；手动上滚查看旧集不被打断（60px 阈值判断）。

### Verified
- `node --check` OK + `mod-parse-check` OK；`verify-u1-bxd.mjs` 62 项全绿（新增 A43–A46）；`acceptance.mjs` 16 项全绿。

## [3.0.29] - 2026-09-28

### Improved（响应与反馈：取消即时生效、冷却倒计时、集间等待提示）
- **取消不再假死**：新增可中断等待 `bx2c`（500ms 粒度查 `bx0.cancel`），原地冷却 5 分钟期间点「取消」立即生效，不再等到睡醒才响应。
- **原地冷却倒计时**：`th≥3` 冷却改为分段 `while` 循环，状态行每 10 秒刷新 `连续受限冷却中…剩X分Y秒（可点取消）`，剩余时间可见。
- **集间等待提示**：集间 `wt` 等待前状态行更新为 `…等待Ns后下一集…剩约X分`，且仅在 `a+1<F0.length`（还有下一集）时显示，末集不再多余提示。

### Verified
- `node --check` OK + `mod-parse-check` OK；`verify-u1-bxd.mjs` 58 项全绿（新增 A40–A42 响应反馈）；`acceptance.mjs` 16 项全绿。

## [3.0.28] - 2026-09-28

### Improved（UI 可读性与可滚动性）
- **批量进度列表可滚动**：`#batch-progress` 加 `max-height:280px; overflow-y:auto`，千集级批量不再把面板撑满半屏、且可回滚查看早期集。
- **成功/失败行浅底色**：`b-ok` 行 `#f2fbf6`、`b-fail` 行 `#fdf0f0`，扫一眼即分清成败。
- **状态行卡片化**：`#batch-status` 加浅灰底+圆角+内边距，信息区不再挤成一团。
- **完整性条卡片化**：`#up-integrity>span` 浅蓝底卡片 `background:#f0f6fa`，数字更易读。
- **收起态 toggle 小型化**：`.hide #toggle` 缩小字号/内边距并贴边圆角，收起后不再是大块粉蓝按钮占屏幕右下。

### Verified
- `node --check` OK + `mod-parse-check` OK；`verify-u1-bxd.mjs` 55 项全绿（新增 A39 UI 静态）；`acceptance.mjs` 16 项全绿。

## [3.0.27] - 2026-09-28

### Added（风控对抗：下载腿自适应退避 + 原地冷却）
- **下载腿受限计数**：逐集调用 `x/player/playurl` 时捕获 `-799`/`请求频繁`/`限制`/`412`/`风控`/`未返回DASH` 计入 `th`，命中即把集间等待拉长到 `dv×(1+th×2)` 秒——受限即时放慢，不再全速撞风控。
- **连续受限原地冷却**：`th≥3` 原地等待 5 分钟（写本地冷却标记 `bilibili_helper_batch_cool_<P>`）后继续，已抓列表不丢、不退出循环；与列表腿 15min 冷却同语义但仅限该下载键，面板提示“连续受限N次，原地冷却约5分钟继续”。

### Verified
- `node --check` OK + `mod-parse-check` OK；`verify-u1-bxd.mjs` 54 项全绿（新增 A36–A38 下载腿风控）；`acceptance.mjs` 16 项全绿。

## [3.0.26] - 2026-09-28

### Added（UP 主视频检索 + 天然降风控）
- **关键词筛选批量**：UP 主按钮旁新增「关键词」输入框；填写后列表腿走 `x/space/arc/search?keyword=<词>`（B 站原生服务端筛选），只抓命中视频——1159 集的空间筛到几十集，页数骤降即风控负担骤降，零额外请求。
- 缓存/冷却 key 按关键词隔离（`uplist_<mid>_kw_<词>`），不同关键词互不串缓存；完整性条 `预期=筛选后总数`，`缺=预期-实际` 语义不变。
- 开始行显示 `正在获取UP主视频列表（筛:<词>）…` 提示当前筛选态；留空则与旧版完全一致。

### Verified
- `node --check` OK + `mod-parse-check` OK；`verify-u1-bxd.mjs` 51 项全绿（新增 A35 关键词链路）；`acceptance.mjs` 16 项全绿。

## [3.0.25] - 2026-09-28

### Fixed / Improved（批量下载持续优化）
- **修：UP 主批量完成后 up-btn 永久禁用**——`Dv` 成功路径与重试后 up-btn 不复位（v3.0.24 只复位了 batch-btn）；`bxD` 结尾统一复位 `up-btn`，UP 主批量跑完即可再次点击。
- **并发守护**：`bxD` 开头加 `if(bx0.running)return`，防「重试失败 N 集」按钮双击并发两轮批量。
- **剩余 ETA**：`正在处理 a/N` 行追加 `剩约X分`（剩余集数×速度档×1.25），跑起来后随时可见剩余时间。
- **skip 计数可见**：「跳过上次已下载的集数」标签后追加 `（已有N集）`，一眼可见断点续传基数。

### Verified
- `node --check` OK + `mod-parse-check` OK；`verify-u1-bxd.mjs` 50 项全绿（新增 A31–A34）；`acceptance.mjs` 16 项全绿。

## [3.0.24] - 2026-09-28

### Added（批量下载该 UP 主全部视频：失败可重试、分类可见、有预期）
- **一键重试失败项**：批量结束且有失败时，状态区追加“重试失败 N 集”按钮，仅重跑失败项（`bx0.failItems` 引用直传 `bxD(e,t,P,only)`，失败项此前已由 `bx7` 剔除已下载记录，重试与“跳过已下载”天然不冲突；可连续重试直至收敛）。
- **失败分类计数**：`需会员/登录`（-10403/大会员/充电/登录）与 `其他` 分别计数，结束行如 `全部完成：成功N 跳过M 失败K（需会员/登录a，其他b）`。
- **开始行 ETA 预估**：日志行追加 `预计集间等待约X分钟（不含下载/合并耗时）`（集数×速度档×1.25），重试轮标注“本轮为失败重试，仅 N 集”。
- **缓存文案修正**：`Dv` 开始行“1缓存列表”写死数字改为 `X小时前缓存列表`（由 `t.cacheTs` 计算，与 U1 冷却分支同口径）。
- **resume 行即时刷新**：`bxD` 结尾按当前 key 的已下载记录刷新「跳过上次已下载」行显隐，不必等面板重渲染。

### Verified
- `node --check` OK + `mod-parse-check` OK；`verify-u1-bxd.mjs` 46 项全绿（新增 A27–A30）；`acceptance.mjs` 16 项全绿。

## [3.0.23] - 2026-09-28

### Fixed（面板无显示：Dv 模板闭合符误写致整文件 module 解析失败）
- `Dv` 行 `o.textContent` 模板字符串闭合符误写为双引号 `"`（应为反引号）；`node --check`（经典脚本语义）对此通过，但浏览器 `type=module` 注入时整文件解析失败 → 无面板、无图标、无下载入口（v3.0.21/v3.0.22 均受影响；旧文件 `SourceTextModule` 复验 `Unexpected identifier '当前为$'`，修复后 `MODULE: OK`）。
- 新增 `evidence/mod-parse-check.mjs`（`vm.SourceTextModule` module 语义解析）+ harness 同步 A26 断言，防复发。

### Verified
- `node --check` OK + `mod-parse-check` OK；`verify-u1-bxd.mjs` 42 项全绿（新增 A26 module 解析）；`acceptance.mjs` 16 项全绿。

## [3.0.22] - 2026-09-28

### Fixed（面板无显示：二次 define 抛错中断整条链路）
- `H` 自定义元素注册加幂等保护：`customElements.get(B)` 判重 + try/catch。seed 重复注入（扩展重载/页面恢复/多实例同页）时，旧代码二次 `define('bilibili-helper-host')` 抛 `NotSupportedError`，`y0` 入口中断 → 无面板、无图标、无下载入口；现已跳过重复注册，后续链路正常渲染。
- 真页验证：B 站视频页 `__INITIAL_STATE__` + `#bilibili-player .bpx-player-ctrl-quality` 正常（`X()` 门槛可过）；裸页复现旧语义二次 define 抛错、新语义零抛错。

### Verified
- `node --check` OK；`verify-u1-bxd.mjs` 41 项全绿（新增 A25 H 幂等静态）；`acceptance.mjs` 16 项全绿。

## [3.0.21] - 2026-09-27

### Added（缓存/部分列表二次确认：防“下了30个以为下完了”）
- `Dv` 在 `U1` 返回缓存/部分且有数据时，先弹 `window.confirm` 二次确认：文案含 `预期/实际/缺/缓存时间` 四字段；点取消则停手复位（按钮恢复、`#batch-status` 留“已取消…可点重抓”提示），不进 `bxD`；点确定才继续下载。完整性条口径不变。

### Verified
- `node --check` OK；`verify-u1-bxd.mjs` 40 项全绿（新增 A24 Dv 二次确认静态）；`acceptance.mjs` 16 项全绿。

## [3.0.20] - 2026-09-26

### Added（UP 主列表完整性条：用户可自证“真的提完了”）
- 新增常驻**完整性条** `#up-integrity`（`up-btn` 下方，与 `#batch-status` 分离，下载循环覆盖不到）：`完整性：预期Y / 实际N / 缺M / 完整|部分|缓存|冷却 / 缓存<时间>`；部分/缓存状态附带**「重抓完整列表」**按钮（直调 `Dv`，冷却期内零请求只提示）。
- `U1` 全部返回路径回传 `expected`（服务端 `page.count` 快照）+ `cacheTs`（本次/缓存时间戳）：全量=快照、缓存=`cc.count`/`cc.ts`、冷却=0；`Dv` 落盘 `bx0.lastUplist`，`W0` 重渲染时恢复。
- 判定口径：`缺0 / 完整` + 开始行 `共N个视频，开始批量下载…`（无后缀）+ 结束行 `🎉 全部完成` 三者一致即真提完；开始行带 `（部分列表…）`/`（缓存列表…）` 即被截断/走缓存。

### Verified
- `node --check` OK；`verify-u1-bxd.mjs` 39 项全绿（新增 A21–A23 静态 + E1–E3 完整性字段场景）；`acceptance.mjs` 16 项全绿。

## [3.0.19] - 2026-09-25

### Changed（中途分页风控加强：2/30 后“休息16秒(第2次)”场景）
- **起步 settle 2–3s**：点击后先停 2–3s 再发 pn1，避开“点击 burst 即限流”。
- **页间隔档位联动 4.5–10s**：列表页间隔跟随批量速度档（快速/标准约 4.5–6s、保守约 5.5–7s、最稳约 7–8.5s、超稳约 8.5–10s），被限流时切“超稳 18s”整条链路都慢。
- **受限自适应放慢**：每次 -799/网络异常恢复后页间隔 +2s（上限 +6s），越限越慢。
- **中途退避加长 20/26/32/38s**：中途分页退避从 12/16/20/24s 加长到 `14+rt*6`s + 抖动，提示“已自动放慢”；退避耗尽写 15min 冷却并按已抓页增量缓存返回 partial（之前抓到的不丢）。
- **逐页增量缓存 + 逐页冷却复检**：每成功抓一页即写 `bilibili_helper_uplist_<mid>`；每页请求前复检冷却标记，冷却写入后即停。
- pn1 双败 fast-fail / 零抛错 / 去重 / 上限 / 禁单条回填语义全部保留。

### Verified
- `node --check` OK；`verify-u1-bxd.mjs` 33 项全绿（含新增 C6 中途恢复场景：pn3 处 -799 两次后退避恢复→增量继续全量）；`acceptance.mjs` 16 项全绿。

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
