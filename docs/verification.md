# 验证与证据

仓库内置**零网络、确定性**验证门，任何人可本地复跑。

## 三条命令

```bash
node --check bilibili-helper-content-script.js   # 语法
node evidence/verify-u1-bxd.mjs                  # 93 项 harness
node evidence/acceptance.mjs                     # 16 项验收门
node evidence/accept-selfcheck.mjs               # 单命令自验收（跑上面三门 + 版本同步）
```

## harness 覆盖（verify-u1-bxd.mjs）

- **A1–A57 静态**：U1 走 legacy `arc/search`、零 wbi / 零 throw / 零登录语义、fetch 预算=1、档位联动页间隔 + 起步 settle、pn1 双败 fast-fail + 15min 冷却记忆、中途加长退避 + 自适应放慢、缓存 failover、上限 40 页、去重、`top/arc` 兜底已移除、bxD 节奏/冷却/持久化、逐集 cid 经 pagelist、**U1 回传 `expected`+`cacheTs`**、**常驻完整性条 `bx8`+`#up-integrity`+重抓按钮**、**Dv 落盘 `lastUplist` 并重渲染**、**Dv 缓存/部分 `confirm` 二次确认**、**H 自定义元素幂等（`get` 判重 + try/catch，防二次 define 无面板）**、**主脚本 module 语义可解析（`mod-parse-check.mjs`，防模板闭合符误写致整文件无面板）**、**失败一键重试（`failItems`+重试按钮，仅重跑失败项）**、**失败分类计数（需会员/登录 vs 其他）**、**开始行 ETA 预估**、**Dv 缓存文案小时数**、**bxD 结尾复位 up-btn（修永久禁用）**、**bxD running 并发守护**、**正在处理行剩余 ETA**、**skip 计数（已有 N 集）**、**UP 主关键词筛选（`up-kw` + `keyword=` 服务端筛选 + 缓存 key 隔离）**、**下载腿受限计数（th）**、**连续受限原地冷却 5 分钟继续**、**受限即时拉长集间（wt×(1+th×2)）**、**UI 卡片化/批量进度滚动/成败底色/收起态 toggle**、**可中断等待 bx2c**、**原地冷却倒计时可取消**、**集间等待前 status 提示**、**当前集 b-cur 高亮**、**取消按钮防连点**、**结束行耗时**、**progress 近底自动跟随**、**多 P 视频 Bx 展开（pages→每P一项）**、**mp-<bvid> 批量键**、**Dx 空列表 UI 反馈**、**batch-clear 绑定守护**、**dash video-only 降级**、**出错了空 message 兜底**、**d0 空 data 未登录判定**、**U 空链接 INVALID_RESPONSE**、**support_formats 可选**、**UI 精简（删教程/赞赏/notice iframe）**、**side-bar 移除 main 撑满**。
- **A58–A65 静态（v3.0.37）**：合集分集按分P展开（`bxSp` 三级取值 + `bxPgs` 逐P条目）、分集取不到 pages 时留 `chk` 标记、下载腿 pagelist 改为展开全分P并插入队列（并断言旧 `data[0].cid` 只取 P1 的写法已删除）、分P命名 `标题_Pn_分P名`、按钮文案「N集/共M个分P」、旧「合集只取每集首P」映射已移除（回归防护）、cid 解析先于行渲染与 skip 判定、分P列表失败带接口码（受限计 `th` 走原地冷却）。
- **B1–B5 重放**：以 `evidence/up-list-pn1.json` 真实 30 条逐字节为第 1 页，确定性派生至 39 页 → 收敛 **1159/1159** 非 partial、零 wbi、页间隔合规。
- **B6–B13 合集多P真实状态重放（v3.0.37）**：以 `evidence/season-multip-state.json`（用户提交页面 `__INITIAL_STATE__` 抽取，合集「Blender教程合集」4 集各 90/120/56/58 分P）跑当前 `Bx` 源码 → **展开 324 条、324 个唯一 cid、cid 与各分集 `pages` 逐字节对齐**；另覆盖 4 个不回归场景：无合集单视频多P→90P、分集无 pages 且无 avl→4 集带 `chk`、分集无 pages 有 avl→仍 324、普通合集（4 集各单P）→仍 4 集不误伤。
- **C×6 预算场景**：中途 `-352`→120 条 partial；首屏 `-403`→空 partial；首屏网络异常→pn1 双败 fast-fail 进冷却；`-799` 一次后恢复→全量 1159；pn1 双败 `-799` 进冷却 + 二次零请求；中途 pn3 `-799` 两次后恢复→增量继续全量。全部零抛错、fetch 有界。
- **E1–E3 完整性字段**：全量 `expected==count` 且 `cacheTs>0`；部分 `expected==count` 且缺数正确；冷却 `expected==0` 且 `cool` 标记。
- **D1–D2 UP 批量下载腿离线仿真（v3.0.37 补）**：`evidence/sim-up-batch.mjs` 取真 `bxD` 源码段（未改写一字）+ 受控 I/O（编排 pagelist/playurl/`-10403`/`-799`）跑全程。5 条无 cid 条目（UP 列表形状）→ 恰 5 次 pagelist → 就地展开 12 行（4+3+1+1+3）→ playurl 按逐分P cid 调用 9 次 → 结束行「成功 8 跳过 2 失败 2（需会员/登录 1，其他 1）」；行渲染 12 条 + 失败 2 条✘；「重试失败 2 集」一键收敛（成功 2/失败 0，只补 2 次 playurl）；对照组（HEAD 旧 `bxD`）只产出 P1（3 文件无 `_P` 命名）且 skip 永不命中（跳过 0）。
- **D2 失败行不得隐身**：分P列表失败（抛错在行渲染之前）也必须渲染 ✘ 行（`p.parentNode||r.appendChild(p)`），否则失败清单有、进度行无，对不上账。
- **A66 批量行结构化（v3.0.38）**：`b-idx` 等宽计数列 + `b-ep` 标题 + `b-st` 状态词；`b-cur` 用 `outline` 全描边替代侧色条；`#batch-status` 块级独占一行；`prefers-reduced-motion` 下批量区动画全关。
- **A67 合并 MEMFS 防泄漏（v3.0.39）**：`_0` 清理回调删输出文件 `t`（失败路径三文件全删并重抛）；`a0` 对象 URL 60s 自回收；`t0` 合并失败行内显错（`✘ 原因`）且重抛保证批量记失败而非 ✔；`beforeunload` 空实例守护（`q.ffmpegInstance?…`）。

## acceptance.mjs（16 项）

- **R1 四腿**：view / pagelist / playurl / byte 各 **1158/1158**，risk=0。
- **R2**：`wbi`/`-403`/`-401`/`访问权限不足` 静态计数=0；`pn1 code=0 count=1159`；`top code=0`。
- **R3**：`live-code-inventory` 分离——`code0=4674`/`HTTP_206=1164`/`-799×1`/`412×2`/`transient×3`（出口配额，均已退避恢复）。

## 证据目录（`evidence/`）

`full-*-progress.jsonl`（四条腿逐条记录，**被 `acceptance.mjs` 活引用为数据源，勿删**）+ `live-full-*-summary.json`（汇总）+ `verify-*.json` + `r3-semantics.json` + 探针脚本（`probe-*.mjs`）。完整清单见 `evidence/live-code-inventory.json`。

v3.0.37 新增两个**被 harness 活引用**的取证文件（勿删）：

- `season-multip-state.json` — 用户提交页面（`BV1jnHf6JEdk`）`__INITIAL_STATE__` 的原样抽取（仅裁未使用字段）：合集 4 集 × 90/120/56/58 分P + `availableVideoList`。B6–B13 全部重放基于它。
- `live-bx-expand.json` — 同页 js-reverse 实机（mainWorld）加载主脚本展开链逐字节执行 `Bx()` 的结果：修复前 4 条 / 修复后 324 条（90/120/56/58，324 唯一 cid）。
- `sim-up-batch.mjs` + `sim-up-batch-result.json` — UP 批量下载腿离线仿真脚本与落盘结果（被 verify D1 活引用，勿删）。

已清理冗余（v3.0.30 后）：`browser-p01.txt`（被 `browser-all-bvids.txt` 覆盖）、`status-ascii.txt`（v3.0.16 一次性快照）、`live-collect.log`（运行时生成，`*.log` 已 ignore）。

[← 返回文档首页](./index.md)
