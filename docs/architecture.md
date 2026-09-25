# 架构与文件说明

```
manifest.json                          # MV3 清单（version 3.0.20）
bilibili-helper-content-script-seed.js # 注入引导：创建 <script type=module> 加载主脚本，注入 baseUrl/manifest
bilibili-helper-content-script.js      # 主脚本（≈43KB）：解析 playurl、渲染面板、ffmpeg 合并、批量下载
ffmpeg-core.js / .wasm / .worker.js    # ffmpeg.wasm 0.12.1 —— 音视频合并（高级模式）
ffmpeg.worker.js                       # ffmpeg 运行 worker
popup.html                             # 工具栏弹窗
icon.png                               # 图标
evidence/                              # 验证证据 + harness（见 verification.md）
docs/                                  # 本文档站
```

## 关键模块（主脚本内）

| 符号 | 职责 |
|------|------|
| `d0` / `i0` / `U` | 解析 `x/player/playurl`，归一化 dash/durl，生成下载链接描述 |
| `t0` / `R` / `o0` | 下载执行：合并模式（音频+视频→ffmpeg）与单 durl 直存 |
| `Bx` | 从 `__INITIAL_STATE__.videoData.ugc_season` 提取合集列表 |
| `U1` | UP 主全部视频列表：`x/space/arc/search` 分页 + 递增退避 + 去重收敛；全部返回路径回传 `expected`（服务端总数快照）+ `cacheTs` |
| `bx8` | 常驻完整性条 `#up-integrity` 渲染器：预期/实际/缺/状态/缓存时间 + 部分·缓存一键重抓 |
| `bxD` | 批量下载循环：逐集 pagelist→playurl→下载，delay/jitter/失败冷却/持久化 |
| `Dx` / `Dv` | 入口：合集批量 / UP 主批量 |
| `W0` / `Z0` | 面板装配与事件绑定 |

## 数据流

```
页面 __INITIAL_STATE__ ─┬─> Bx() 合集列表
                        └─> U1(mid) UP主列表 ──> bxD(list, key)
                                                    │  每集:
                                                    │   pagelist(cid) → playurl → t0/R 下载
                                                    │   成功→bx6持久化cid / 失败→bx7移除+冷却
                                                    ▼
                                          进度面板 + 失败清单
```

## 存储键

- `bilibili_helper_batch_done` — `{key: {cids:[...]}}` 已完成集（key= season id 或 `up<mid>`）
- `bilibili_helper_uplist_<mid>` — `{ts, count, v}` 列表增量缓存（每页成功即写；`count` 为服务端总数快照，`v.length` 为实际抓到数）
- `bilibili_helper_uplist_cool_<mid>` — 15min 冷却标记
- `bilibili_helper_batch_delay` — 批量速度档（1/3/6/12）
- `bilibili_helper_batch_qn` — 固定清晰度
- `bilibili_helper_download_mode` / `_merge_mode` / `_show` — 面板偏好

[← 返回文档首页](./index.md)
