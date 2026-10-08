# Changelog

本项目遵循语义化版本。所有显著变更记录于此。

## [3.0.40] - 2026-02-14

### Fixed（下载卡住不动，如停在 55%：`o0` 无停滞超时，TCP 半死则永远等）
- **现场**：视频下载到一半（如 9.90MB 停在 5679071/10379978=55%）进度永冻。旧 `o0` 是纯 `fetch` + `ReadableStream` 逐块读，`l.read()` 无任何超时——CDN 限流/连接僵死时 promise 永不 resolve，进度条永远停在原地，也无重试，用户只能手动取消重下。
- **修**：`o0` 重写为停滞检测 + `Range` 断点续传——每收到一块重置 20 秒停滞计时，超时则 `cancel` 当前流并抛错 → 外层 `catch` 用 `Range: bytes=<已收>-` 续传（已收分片保留在 `K` 里不丢）；服务端不支持 206 则回退全量重下；轮间 1.5s×轮次退避；5 轮耗尽才抛错。首轮请求与旧行为一字不差（无 Range 全量拉，`content-length`/`content-range` 双路推导总量）。
- **附带**：进度回调 `d` 加 `try/catch` 包裹（防面板已销毁时回调抛错中断下载）；续传等待中也刷一次进度（行上能看到已收字节不动→续传中）。

### Verified
- `node --check` OK + `mod-parse-check` OK；`verify-u1-bxd.mjs` **94 项全绿**（新增 A68 静态断言钉住 `Range` 续传/停滞文案/5 轮上限/`new Blob(K)` 分片组装四处）；`acceptance.mjs` 16 项全绿；`accept-selfcheck.mjs` 全绿（93→94，A68 双侧核对，版本同步 3.0.40）。

## [3.0.39] - 2026-02-14

### Fixed（长时间批量下载爆 `memory access out of bounds`：合并器 MEMFS 越用越满）
- **现场**：批量下载跑到中途某集，合并时抛 `✘ RuntimeError: memory access out of bounds`。wasm 内存实测 `init=32MB / max=2048MB`（可增长但有顶），旧链路每集在 MEMFS 里留下**输出文件从不删**（`_0` 的清理回调只删输入 `r/N`，不删输出 `t`；批量下载腿的"上一集删"逻辑找的也是"本集新增"——而输出文件是**本集新增**，被 `ffmpegUsedFiles.delete(K)` 移出集合后永远没人删），跑几十集高清就把 2GB 顶爆。
- **堵四处泄漏**：`_0` 清理回调加 `a.deleteFile(t)`（输出文件随本集一起删）；`a0` 对象 URL 加 60s 自回收（旧逻辑只 `q0` 登记、永不 `revoke`，靠批量/关闭页才扫一次）；`t0` 合并失败加 `catch` 显错（旧 `try/finally` 无 `catch`，爆了只剩"合并中…"转圈）；`beforeunload` 的 `ffmpeg.deleteFile` 裸引用改 `q.ffmpegInstance?.deleteFile` 空实例守护（旧代码在实例未建时自身抛错）。
- **附带**：合并成功后 JS 侧 `arrayBuffer`（`c`）置空引用（`t0` 已有 `N/t/c=null`，本次确认保留），`readFile` 返回的 `n.buffer` 在 `a0` 建 Blob 后 `e=null` 释放。

### Verified
- `node --check` OK + `mod-parse-check` OK；`verify-u1-bxd.mjs` **93 项全绿**（新增 A67 静态断言钉住 `deleteFile(t)`/`blobUrls.delete(N)`/`catch(G)` 显错/`q.ffmpegInstance?` 守护四处；sim-up-batch 17✓ 与 B6–B13 不受合并链影响照常全过）；`acceptance.mjs` 16 项全绿；`accept-selfcheck.mjs` 全绿（92→93，A67 双侧核对，版本同步 3.0.39）。

## [3.0.38] - 2026-02-14

### Changed（批量下载区 UI：层次、状态列、描边、可读性）
- **进度行结构化**：旧模板把「计数+标题+状态」挤在一个 `span` 里（`1/324 标题… 等待`），324 集时计数列随标题长短左右跳动、计数与标题粘连难扫读。改：`<span class=b-idx>`（等宽数字、右对齐、固定 `min-width:7ch`，`1/9` 到 `324/324` 同宽）+ `<span class=b-ep>`（标题，58ch 截断+hover 全标题）+ `<span class=b-st>`（状态词：等待/✔/↷/✘）。bxD 五处行模板（等待/跳过/合并成功/直链成功/失败）逐条迁移。
- **进行中行描边替代侧色条**：旧 `.b-cur` 用 `box-shadow: inset 3px 0 0` 左色条——impeccable 禁止的"侧边条装饰"写法；改 `outline: 2px solid #7cc4e8` 全描边+底色保留，对比度与原一致。
- **状态行块级化**：旧 `#batch-status` 是裸 `span`，跑起来时「正在处理 12/324…」会和「取消」按钮挤在同一行；改 `display:block`，状态独占一行。
- **`prefers-reduced-motion`**：批量区全部动画（`b-cur` 脉动、`b-celebrate`、`b-fade` 入场、`.b-bar` 过渡/不确定条）在系统减弱动态偏好下全关。原有暗黑感知变量保持不动。

### Verified
- `node --check` OK + `mod-parse-check` OK；`verify-u1-bxd.mjs` **92 项全绿**（新增 A66 静态断言钉住 `b-idx`/`b-st`/`outline`/`display:block`/`reduced-motion` 五处；sim-up-batch 17✓ 不受模板形状影响照常全过）；`acceptance.mjs` 16 项全绿；`accept-selfcheck.mjs` 全绿（91→92，A66 双侧核对，版本同步 3.0.38）。

## [3.0.37] - 2026-02-14

### Fixed（合集「每个分组只下第一个视频」：分集本身就是多P，只取了 P1）
- **现场**：`https://www.bilibili.com/video/BV1jnHf6JEdk/` — 合集「Blender教程合集（1/4）」有 4 集，而**每集自己都是一门多P课程**（`sections[].episodes[].pages[]` 分别 90/120/56/58 分P，共 324）。旧 `Bx()` 把每个分集压成一个条目、`cid` 取分集 `cid`（= 该视频 **P1 的 cid**）→ 点「批量下载合集（共4集）」实际只下到 4 个视频，其余 320 个分P 拿不到。
- **`bxSp` 三级取全部分P**：当前视频 `videoData.pages`（正在看的那一集最新）→ 分集 `ep.pages` → `availableVideoList[a].list`（新播放页结构，同样带逐分P cid）。三者都在 `INITIAL_STATE` 里，**列表腿零额外请求**。
- **`bxPgs` 逐分P展开**：每分P一条 `{aid, bvid, cid(该P独立), title}`，按 cid 去重。
- **`bxPn` 命名**：`视频标题_P{n}_{分P名}`，分P名尾部完整保留（总长 >80 只截标题前缀），配合进度行 3 位序号全程可定位。
- **按钮文案**：分集数 ≠ 条目数时显示 `批量下载合集（4集/共324个分P）`，不再只说「共4集」（`bxSn`）。
- **`bxD` 兜底展开**：分集取不到 `pages` 时条目带 `chk` 标记，下载到该集时用 pagelist 取全部分P并 `F0.splice(a+1,0,...)` 就地入队（每P一条、cid 独立），不静默只下 P1。
- **UP 批量同修**：`x/space/arc/search` 不返回分P数（条目 `cid=0`），旧代码 `h.cid=pg.data[0].cid` 同样只下每个视频的 P1 → 改为按全部分P展开；并把 cid 解析**前移到进度行渲染与「跳过上次已下载」判定之前**，UP 批量的 skip 判定首次真正生效（此前 `bx5(P).includes(0)` 恒假）；分P列表失败时带接口码（受限计 `th` 走原地冷却）。
- **失败行不得隐身（仿真抓到的真 bug，已修）**：旧循环里 `p.appendChild` 写在 cid 解析**之后**，分P列表失败（`throw` 在行渲染之前）→ 该条目只有失败清单、无进度行。补 `p.parentNode||r.appendChild(p)` 进 catch，保证 ✘ 行必渲染。

### Verified
- `node --check` OK + `mod-parse-check` OK；实机 js-reverse（mainWorld）逐字节执行新 `Bx()` 于真实页 `BV1jnHf6JEdk` → **324 条 / 324 唯一 cid**（90/120/56/58 分组计数正确），证据 `evidence/live-bx-expand.json`。
- `verify-u1-bxd.mjs` **91 项全绿**（A47 更新 + 新增 A58–A65 静态 + B6–B13 真实状态重放：324 条与各分集 `pages` cid 逐字节对齐，另覆盖「无合集单视频多P→90P」「分集无 pages 无 avl→4 集带 chk」「分集无 pages 有 avl→324」「普通合集 4 集各单P→仍 4 集」四个不回归场景 + **D1–D2 UP 下载腿离线仿真**：真 `bxD` 源码段 + 受控 I/O 跑全程——5 条无 cid→恰 5 次 pagelist→展开 12 行→playurl 逐分P 9 次→「成功 8 跳过 2 失败 2（需会员 1+其他 1）」，「重试失败 2 集」一键收敛只补 2 次 playurl；对照组旧 `bxD` 只产出 P1 且 skip 永不命中；证据 `evidence/sim-up-batch.mjs` + `sim-up-batch-result.json`）；证据 `evidence/season-multip-state.json`。`acceptance.mjs` 16 项全绿；`accept-selfcheck.mjs` 全绿（版本同步 3.0.37）。

## [3.0.36] - 2026-09-29

### Changed（UI 精简——移除外部宣传/教程/赞赏区）
- **删「使用教程及常见问题解答」链接行**：`n0` 模板标题下方移除（面板更聚焦下载本身）。
- **删 `.beg` 赞赏区**：「五星好评」按钮移除。
- **删 `#notice-frame` iframe**：`#side-bar>.notice`（远程 `csser.top` 公告区，含「最新版本/已安装版本/微信赞赏二维码/教程链接」外部内容）整体移除；`J0` postMessage 逻辑保留但加 `if(!i)return` 兜底；`toggle` 展开时不再 postMessage。
- **`#side-bar` 移除**，`#main` `flex:7`→`flex:1` 撑满宽。

### Verified
- `node --check` OK + `mod-parse-check` OK；`verify-u1-bxd.mjs` 73 项全绿（新增 A56–A57）；`acceptance.mjs` 16 项全绿。

## [3.0.35] - 2026-09-29

### Fixed（「出错了」未解决根因：U 空链接仍回 code=OK）
- **`U` 空链接改 INVALID_RESPONSE**：`o.dash||a.durl` 进入分支后 `r.video`/`r.audio` 为空数组或 `m,p` 全 undefined 时，此前仍返回 `code=OK` + `dash:undefined,durl:undefined` → `s0` `n===OK` → `T(code:OK)` → `l0` 「出错了 :(」。现在：`p`（video 流）存在即可下（video-only 降级 durl）；`a.durl` 非空可下；全空返回 `INVALID_RESPONSE` + 登录态判定提示（未登录→「请先登录」；已登录→「接口未返回可用下载链接（dash/durl 为空或流受限）」）。
- **`support_formats` 可选防 TypeError**：`Object.values(c)` 对 `support_formats` 缺失时抛 `Cannot convert undefined or null to object` → `Object.values(c||{})`。

### Verified
- `node --check` OK + `mod-parse-check` OK；`U` 四场景模拟（video-only 降级 / 全空 INVALID_RESPONSE / 完整 dash / 纯 durl）全部正确；`verify-u1-bxd.mjs` 71 项全绿（新增 A54–A55 + A51 断言更新）；`acceptance.mjs` 16 项全绿。

## [3.0.34] - 2026-09-29

### Fixed（「出错了」根因：未登录 / playurl 空 data 明确提示）
- **`d0` playurl 空 data 判定**：`code=0` 但 `data.dash` 与 `data.durl` 均无（未登录态 B 站不返回流，或接口受限空响应）→ 此前落入「出错了 :( 无可用下载链接」不明提示；现判定 `__INITIAL_STATE__.user.isLogin===false`/`mid` 缺失 → 明确提示「当前未登录 B 站或接口未返回下载流，请先登录后刷新重试」；已登录则提示「接口未返回下载链接（可能风控/流受限），请稍候重试或切换清晰度」。

### Verified
- `node --check` OK + `mod-parse-check` OK；`verify-u1-bxd.mjs` 69 项全绿（新增 A53）；`acceptance.mjs` 16 项全绿。

## [3.0.33] - 2026-09-29

### Fixed（「出错了 :(」——code=OK 但无下载链接）
- **dash video-only 降级**：`playurl` 返回 `dash` 但 `audio` 缺失（无声视频/流受限）且 `durl` 为空时，此前 `dash:undefined,durl:undefined` → 「出错了 :(」。现在 video 流存在即降级为单链接 `durl=[{url:video.base_url,size,backup_url}]`，走分段下载可正常保存。
- **「出错了」空 message 兜底**：`code=OK` 但 dash/durl 全无且 `message` 为空时，此前显示「出错了 :( 」（空白无提示）。现在兜底文案「无可用下载链接（可能该视频无音视频流或接口未返回 dash/durl），请尝试切换清晰度或稍候重试」。

### Verified
- `node --check` OK + `mod-parse-check` OK；`verify-u1-bxd.mjs` 68 项全绿（新增 A51–A52）；`acceptance.mjs` 16 项全绿。

## [3.0.32] - 2026-09-29

### Fixed（潜在问题修复）
- **`Dx` 空列表有 UI 反馈**：`Bx()` 返回空时此前仅 `v()` 写日志面板（用户不可见），现在同时写 `#batch-status` 状态行 `未找到可批量下载的合集或分P`。
- **`batch-clear` 防重复绑定**：其点击回调内会再调 `W0(e)` 重渲染行状态，此前无 `dataset.bound` 守护导致每次清空后再点会多重绑定 listener；现加 `bc.dataset.bound` 守护，与其它按钮一致。
- **批量行 label 文案**：`合集：` → `合集/分P：`（多 P 页也走此行）。

### Verified
- `node --check` OK + `mod-parse-check` OK；`verify-u1-bxd.mjs` 66 项全绿（新增 A49–A50）；`acceptance.mjs` 16 项全绿。

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
