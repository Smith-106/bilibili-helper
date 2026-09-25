# 知识库 / 决策记录（kg）

本文件沉淀本仓库的可复用知识、架构约束与排错经验（对应 maestro knowhow / spec / kg）。规则性约束见「Spec」，可复用经验见「Knowhow」。

## Spec（项目约束规则）

- **S1 列表腿零抛错**：`U1` 任何失败一律 partial/空降级，不向上 throw。批量入口据此判定「是否再试」。
- **S2 单条目兜底不得回填为批量列表**：`x/space/top/arc` 只返回置顶 1 条；若把它当批量列表会导致「只下 1 集」。已从 `U1` 移除该兜底（v3.0.17）。
- **S3 pn1 双败 fast-fail + 15min 冷却记忆 / 中途递增退避**（v3.0.18）：首屏连续失败只重试 1 次（约 12s），再败即停并写 `bilibili_helper_uplist_cool_<mid>`，15min 内零请求直接提示；有缓存则缓存 partial 继续。中途分页仍有界递增退避最多 4 次（≈12/16/20/24/27s）。禁止单次退避后直接落单条目兜底。
- **S4 零登录依赖**：不得引入 `-403`/`-401`/`访问权限不足`/`需要登录` 字面量或登录前置；匿名即可用。
- **S5 不使用 wbi 签名**：列表用 legacy `x/space/arc/search`，播放用 `x/player/playurl`；不得回退到 `wbi/playurl` 或 `mixin` 路径。
- **S6 风控节奏冻结**：页间隔 3500–5000ms（类人）、`t>=40` 上限、`bvid` 去重、`-352` 零重试、批量 `delay+jitter`+连续失败 `>=2`→`delay*3`+`bilibili_helper_batch_done` 持久化 + `bilibili_helper_uplist_<mid>` 列表缓存。改动须保语义。
- **S7 验证门为验收标准**：`node --check` + `verify-u1-bxd.mjs`(28) + `acceptance.mjs`(16) 全绿才可发布。改 U1/bxD 必同步 harness 断言。
- **S8 仓库卫生**：`_metadata/`(商店签名)、`.workflow/` 运行时(tmp/sessions/recovery/embedding*)、`.pi/`(注入)、页面快照(`网页*.txt`)不入库；`.workflow/knowhow/` + `.workflow/kg/maestro.db`（maestro Wiki/kg 知识库）跟踪入库；见 `.gitignore`。
- **S9 无第二完整列表桶**：space HTML 为 SPA 空壳、dynamic feed 需鉴权、series/search-type 报 -400、top/arc 仅 1 条（2026-09-25 实测 T1–T8）。不做换接口 failover，只做节奏+冷却+缓存。

## Knowhow（可复用经验）

- **「-799 后只下 1 集」根因模板**：凡「退避后批量坍缩为 1」，先查兜底源返回条数是否=1。修复=退避重试主列表 + 阻断单条目兜底进批量。
- **离线重放验证法**：用真实 `pn1` 30 条作种子，确定性派生后续页，可零网络证明 `U1` 39 页收敛到 1159（见 `evidence/verify-u1-bxd.mjs` B 段）。
- **预算场景矩阵**：对列表函数用 mock fetch 枚举「中途失败/首屏失败/网络异常/退避恢复」四类，断言 `len/partial/fetchCalls/无抛错`，一次锁定回归。
- **delta-1 结构差**：API declared 1159 vs DOM uniq 1158 = 首屏挂载位 + count 快照差；用 pn1 30/30 逐字节比对 + `top_in_dom` 交叉证。
- **证据最小化供 verifier**：verifier 直读易 EPIPE，把汇总写小 JSON/txt 并把关键输出打进会话日志。

## 变更溯源

- v3.0.16：去 wbi/登录依赖、U1 零抛错 partial。
- v3.0.17：`-799` 递增退避 + 移除 top/arc 单条目兜底（修「只下 1 集」）；仓库清理 + 文档站。
- v3.0.18：防风控重设计——pn1 双败 fast-fail + 15min 冷却记忆（零请求恢复）+ 缓存 failover + 页间隔 3.5–5s 类人 pacing + 列表速度档“超稳 18s”；harness 同步（A13/A14/A14b/A14c/B4/C3/C4 更新 + C5 冷却记忆场景，32 项全绿）。

[← 返回文档首页](./index.md)
