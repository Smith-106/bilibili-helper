# 知识库 / 决策记录（kg）

本文件沉淀本仓库的可复用知识、架构约束与排错经验（对应 maestro knowhow / spec / kg）。规则性约束见「Spec」，可复用经验见「Knowhow」。

## Spec（项目约束规则）

- **S1 列表腿零抛错**：`U1` 任何失败一律 partial/空降级，不向上 throw。批量入口据此判定「是否再试」。
- **S2 单条目兜底不得回填为批量列表**：`x/space/top/arc` 只返回置顶 1 条；若把它当批量列表会导致「只下 1 集」。已从 `U1` 移除该兜底（v3.0.17）。
- **S3 pn1 双败 fast-fail + 15min 冷却记忆 / 中途加长退避+自适应放慢**（v3.0.19）：首屏连续失败只重试 1 次（约 12s），再败即停并写 `bilibili_helper_uplist_cool_<mid>`，15min 内零请求直接提示；有缓存则缓存 partial 继续。中途分页加长递增退避最多 4 次（≈20/26/32/38s，`14+rt*6`s+抖动），每次退避自适应放慢后续页间隔（+2s/次，上限+6s），耗尽写冷却并按已抓增量缓存返回 partial。禁止单次退避后直接落单条目兜底。
- **S4 零登录依赖**：不得引入 `-403`/`-401`/`访问权限不足`/`需要登录` 字面量或登录前置；匿名即可用。
- **S5 不使用 wbi 签名**：列表用 legacy `x/space/arc/search`，播放用 `x/player/playurl`；不得回退到 `wbi/playurl` 或 `mixin` 路径。
- **S6 风控节奏冻结**：起步 2–3s、页间隔档位联动 4.5–10s（默认约 4.5–6s，超稳档约 8.5–10s）+ 受限自适应放慢、`t>=40` 上限、`bvid` 去重、`-352` 零重试、批量 `delay+jitter`+连续失败 `>=2`→`delay*3`+`bilibili_helper_batch_done` 持久化 + `bilibili_helper_uplist_<mid>` 增量列表缓存（每页成功即写）。改动须保语义。
- **S7 验证门为验收标准**：`node --check` + `verify-u1-bxd.mjs`(40) + `acceptance.mjs`(16) 全绿才可发布。改 U1/bxD/Dv 必同步 harness 断言。
- **S8 仓库卫生**：`_metadata/`(商店签名)、`.workflow/` 运行时(tmp/sessions/recovery/embedding*)、`.pi/`(注入)、页面快照(`网页*.txt`)不入库；`.workflow/knowhow/` + `.workflow/kg/maestro.db`（maestro Wiki/kg 知识库）跟踪入库；见 `.gitignore`。
- **S10 列表完整性可自证（v3.0.20）**：`U1` 全部返回路径回传 `expected`（服务端 `page.count` 快照）+ `cacheTs`；`Dv` 落盘 `bx0.lastUplist` 并经 `bx8` 渲染常驻 `#up-integrity` 条（预期/实际/缺/完整·部分·缓存·冷却/缓存时间），与 `#batch-status` 分离；部分/缓存附「重抓完整列表」按钮直调 `Dv`。判定口径：`缺0/完整` + 开始行无后缀 + 结束行全完成三者一致。
- **S9 无第二完整列表桶**：space HTML 为 SPA 空壳、dynamic feed 需鉴权、series/search-type 报 -400、top/arc 仅 1 条（2026-09-25 实测 T1–T8）。不做换接口 failover，只做节奏+冷却+缓存。
- **S11 列表一律展开到「分P 粒度」（v3.0.37）**：任何批量入口的条目都必须是**一个可播放分P**，`cid` 必须指向该分P。取全部分P的优先级固定为「当前视频 `videoData.pages` > 分集 `ep.pages` > `availableVideoList[].list`」；三处都拿不到时**必须留 `chk` 标记**，由 `bxD` 用 pagelist 兜底展开——禁止把「视频/分集级 cid（= P1）」当作一集静默下掉。命名固定 `视频标题_P{n}_{分P名}`（分P名尾部优先保留）。

## Knowhow（可复用经验）

- **「-799 后只下 1 集」根因模板**：凡「退避后批量坍缩为 1」，先查兜底源返回条数是否=1。修复=退避重试主列表 + 阻断单条目兜底进批量。
- **「每个分组只下第一个视频」根因模板（v3.0.37）**：新式课程合集里 **`sections[].episodes[]` 的每一项本身就是多P视频**——分集对象带 `pages[]`，而它的 `cid` 字段等于该视频 **P1 的 cid**。凡「映射层只读 `ep.cid` / `pg.data[0].cid`」，结果必然是一组一个视频。判据：`Bx().length` 等于 `sections[].episodes[]` 总数而不是 `pages[]` 总数之和即命中。同类坑还有 `x/space/arc/search` 不返回分P数（条目无 cid）→ 下载腿 `data[0].cid` 也只下 P1，且 skip 判定因 cid=0 永不命中。
- **离线重放验证法**：用真实 `pn1` 30 条作种子，确定性派生后续页，可零网络证明 `U1` 39 页收敛到 1159（见 `evidence/verify-u1-bxd.mjs` B 段）。
- **预算场景矩阵**：对列表函数用 mock fetch 枚举「中途失败/首屏失败/网络异常/退避恢复」四类，断言 `len/partial/fetchCalls/无抛错`，一次锁定回归。
- **delta-1 结构差**：API declared 1159 vs DOM uniq 1158 = 首屏挂载位 + count 快照差；用 pn1 30/30 逐字节比对 + `top_in_dom` 交叉证。
- **证据最小化供 verifier**：verifier 直读易 EPIPE，把汇总写小 JSON/txt 并把关键输出打进会话日志。

## 变更溯源

- v3.0.16：去 wbi/登录依赖、U1 零抛错 partial。
- v3.0.17：`-799` 递增退避 + 移除 top/arc 单条目兜底（修「只下 1 集」）；仓库清理 + 文档站。
- v3.0.18：防风控重设计——pn1 双败 fast-fail + 15min 冷却记忆（零请求恢复）+ 缓存 failover + 页间隔 3.5–5s 类人 pacing + 列表速度档“超稳 18s”；harness 同步（A13/A14/A14b/A14c/B4/C3/C4 更新 + C5 冷却记忆场景，32 项全绿）。
- v3.0.19：中途分页风控加强——起步 2–3s settle + 页间隔档位联动 4.5–10s + 受限自适应放慢 + 中途退避加长 20/26/32/38s + 逐页增量缓存 + 耗尽写冷却 + 逐页冷却复检；harness 同步（A13/A14b/B4 更新 + C6 中途恢复场景，33 项全绿）。
- v3.0.20：UP 主列表完整性条——`U1` 回传 `expected`/`cacheTs` + `bx8` 常驻 `#up-integrity` 条（预期/实际/缺/状态/缓存时间）+ 部分·缓存一键重抓；harness 同步（A21–A23 静态 + E1–E3 完整性字段场景，39 项全绿）。
- v3.0.21：`Dv` 缓存/部分二次确认——有数据且 `cached||partial` 时先 `window.confirm`（预期/实际/缺/缓存时间），取消停手复位不进 `bxD`；harness 同步（A24 静态，40 项全绿）。
- v3.0.22：`H` 自定义元素幂等——`customElements.get(B)` 判重 + try/catch，防 seed 重复注入时二次 `define` 抛 `NotSupportedError` 中断 `y0` 入口（无面板/无图标/无下载入口）；真页验证 `X()` 门槛可过 + 裸页新旧语义对照；harness 同步（A25 静态，41 项全绿）。
- v3.0.24：批量失败可重试+分类可见+有预期——`bxD(e,t,P,only)` 第 4 参仅重跑 `bx0.failItems`（`bx7` 已剔除 done，重试与 skip 不冲突）；结束行 `需会员/登录a，其他b` 分类计数；开始行 ETA（集数×速度档×1.25，不含下载/合并）；`Dv` 缓存文案 `Math.max(1,1)` 改 `t.cacheTs` 小时数；`bxD` 结尾刷新 resume 行显隐；harness 同步（A27–A30 静态，46 项全绿）。
- v3.0.25：修 `bxD` 结尾 up-btn 永久禁用（Dv 成功路径/重试后不复位）；`bxD` 开头 `if(bx0.running)return` 防重试双击并发；`正在处理 a/N` 行加剩余 ETA（剩约X分）；skip label 显示 `（已有N集）`；harness 同步（A31–A34 静态，50 项全绿）。
- v3.0.26：UP 主视频关键词筛选——`up-kw` 输入 + `U1(e,n,kw)` + `arc/search?keyword=` 服务端筛选（页数骤降=天然降风控）；缓存/冷却 key 按词隔离 `_kw_<词>`；完整性条 `预期=筛选后总数`；harness 同步（A35 静态，51 项全绿）。
- v3.0.27：下载腿风控对抗——逐集 `playurl` 受限（-799/频繁/412/未返回DASH）计 `th`，命中即 `wt×(1+th×2)` 拉长集间；`th≥3` 原地冷却 5 分钟（写 `bilibili_helper_batch_cool_<P>`）继续、已抓不丢；harness 同步（A36–A38 静态，54 项全绿）。
- v3.0.28：UI 可读性——`#batch-progress` 滚动（max-height 280px，千集级可回滚）；成功/失败行浅底色（#f2fbf6/#fdf0f0）；`#batch-status`/`#up-integrity>span` 卡片化；收起态 toggle 小型化；harness 同步（A39 静态，55 项全绿）。
- v3.0.29：响应与反馈——`bx2c` 可中断等待（500ms 粒度查 `bx0.cancel`），原地冷却倒计时 `剩X分Y秒（可点取消）`，集间等待提示 `等待Ns后下一集`（末集不显示）；harness 同步（A40–A42 静态，58 项全绿）。
- v3.0.30：UI 反馈——当前集 `.b-cur` 浅蓝底+色条+脉动定位，取消按钮即时 disable，结束行 `用时X分Y秒`，progress 近底自动跟随（60px 阈值，上滚不打断）；harness 同步（A43–A46 静态，62 项全绿）。
- v3.0.31：**多 P 视频批量下载**——`Bx` 增补 fallback：`videoData.videos>1` 且无 `ugc_season` 时用 `pages[]` 构造列表（每 P 一集，cid 独立），批量键 `mp-<bvid>` 与合集/UP 主键隔离，按钮文案「批量下载本视频全部P（共 N P）」；真实页 `BV1Mjt96uE44`（12 P 课程页）模拟 `Bx()` 返回 12 集验证通过；harness 同步（A47–A48 静态，64 项全绿）。
- v3.0.32：潜在问题修复——`Dx` 空列表同时写 `#batch-status`（此前仅日志不可见）；`batch-clear` 加 `dataset.bound` 守护（其回调重调 W0 防重复绑定）；批量行 label `合集/分P：`；harness 同步（A49–A50 静态，66 项全绿）。
- v3.0.33：「出错了 :(」修复——dash video-only（无声/流受限）且 durl 空时降级单链接 durl=[video] 可下载；code=OK 无链接且 message 空时兜底文案；harness 同步（A51–A52 静态，68 项全绿）。
- v3.0.34：「出错了」根因提示——`d0` playurl 空 data（code=0 但无 dash/durl）判定：未登录态（user.isLogin=false/mid 缺）→「请先登录后刷新重试」；已登录→「接口未返回下载链接（可能风控/流受限）」；真实未登录页 `BV1ntah6TEvA` 源码验证 videoData 无 dash/durl 且 user.mid undefined；harness 同步（A53 静态，69 项全绿）。
- v3.0.35：**「出错了」真根因**——`U` 在 `o.dash||a.durl` 分支内 `r.video`/`r.audio` 空或 `m,p` 全 undefined 时仍回 `code=OK` 空链接 → 出错了。改：`p` 存在即可下（video-only durl）、`a.durl` 非空可下、全空 INVALID_RESPONSE+登录态判定；`support_formats` 缺时 `Object.values(c)` TypeError 改 `c||{}`；四场景模拟验证；harness 同步（A54–A55+A51 更新，71 项全绿）。
- v3.0.36：UI 精简——删「使用教程及常见问题解答」链接行、`.beg` 赞赏区、`#notice-frame` iframe（远程 csser.top 公告区含版本/微信赞赏/教程外部内容）；`J0` 加 `if(!i)return` 兜底；`#side-bar` 移除 `#main` flex 撑满；harness 同步（A56–A57 静态，73 项全绿）。
- v3.0.37：**合集分集逐分P展开（修「每个分组只下第一个视频」）**——新式课程合集的 `sections[].episodes[]` 每项自身是多P视频（如「Blender教程合集」4 集分别 90/120/56/58 分P，共 324），旧 `Bx` 把每集压成一个 `{cid: ep.cid}`（= 该视频 P1）→ 只下到 4 个。改：`bxSp` 三级取全部分P（当前视频 `pages` > 分集 `pages` > `availableVideoList.list`，列表腿零额外请求）+ `bxPgs` 逐分P生成条目 + `bxPn` 命名 `标题_Pn_分P名` + `bxSn` 按钮文案「4集/共324个分P」+ 取不到 pages 时留 `chk` 交下载腿 pagelist 兜底展开；下载腿 pagelist 由 `data[0].cid` 改为展开全分P并 `F0.splice(a+1,0,...)` 就地入队（UP 批量同修，且 cid 解析前移到行渲染与 skip 判定之前，UP 批量 skip 首次真正生效）；实机 js-reverse 逐字节执行新 `Bx()` 于真实页 `BV1jnHf6JEdk` 得 324 条/324 唯一 cid；harness 同步（A47 更新 + A58–A65 静态 + B6–B13 真实状态重放 4 场景不回归 + **D1–D2 UP 下载腿离线仿真**：真 `bxD` 源码段 + 受控 I/O——5 条无 cid→恰 5 次 pagelist→展开 12 行→playurl 逐分P 9 次→成功 8/跳过 2/失败 2，一键重试收敛；对照组旧 `bxD` 只出 P1 且 skip 永不命中；仿真附带修「分P列表失败行隐身」`p.parentNode||r.appendChild(p)`，91 项全绿）。
- v3.0.38：批量下载区 UI——进度行结构化（`b-idx` 等宽右对齐计数列 + `b-ep` 标题 + `b-st` 状态词，bxD 五处行模板迁移；324 集下计数列不再随标题跳动）+ 进行中行 `outline` 全描边替代 inset 侧色条 + `#batch-status` 块级独占一行 + `prefers-reduced-motion` 全关批量区动画；harness 同步（A66 静态，92 项全绿）。
- v3.0.39：修长时间批量爆 `memory access out of bounds`——wasm 内存 init 32MB/max 2048MB，旧合并链每集在 MEMFS 留输出文件从不删（`_0` 只删输入 `r/N`；批量“删上一集”找的是本集新增而输出正是本集新增，被移出集合后永不删），几十集高清即顶爆。改：`_0` 清理回调加删输出 `t`（失败路径三文件全删并重抛）+ `a0` 对象 URL 60s 自回收 + `t0` 合并失败行内显错且重抛（批量记失败而非 ✔）+ `beforeunload` 空实例守护；harness 同步（A67 静态，93 项全绿）。

[← 返回文档首页](./index.md)
