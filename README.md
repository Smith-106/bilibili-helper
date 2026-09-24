# bilibili哔哩哔哩下载助手

浏览器扩展（Manifest V3），帮助你下载 B 站视频，包括「能看不能缓存」的版权受限番剧、电影、影视、电视剧等内容。

- **商店名称**：bilibili哔哩哔哩下载助手
- **当前版本**：`3.0.17`
- **清单版本**：Manifest V3
- **运行方式**：纯前端注入（content script + ffmpeg wasm 合并音视频），无后端依赖

---

## 功能特性

| 功能 | 说明 |
|------|------|
| 单视频下载 | 解析当前播放视频，给出可下载地址（高级模式自动重命名并合并音视频） |
| 兼容模式 | 直接走浏览器默认下载，资源占用小（不支持自动重命名/合并） |
| 批量下载合集 | 一键批量下载当前 `ugc_season` 合集全部集数 |
| 批量下载 UP 主全部视频 | 在视频页一键拉取该 UP 主全部投稿（legacy `x/space/arc/search` 分页）并逐集下载 |
| 清晰度跟随 | 默认跟随播放器清晰度，可在面板中固定 qn（16–125） |
| 断点续传 | 已下载集数持久化到 `localStorage`，支持「跳过上次已下载」 |
| 失败冷却 | 连续失败自动延长间隔，附失败清单一键复制 |

## 安装

1. Chrome / Edge 打开 `chrome://extensions`（Edge 为 `edge://extensions`）。
2. 开启「开发人员模式」→「加载已解压的扩展程序」→ 选择本仓库目录。
3. 打开任意 `bilibili.com/video/...` 页面，页面底部会出现「B站下载助手」面板。

> 商店版本见 README 顶部图标跳转链接（脚本内嵌 Chrome Web Store / Edge Add-ons 地址）。

## 使用

### 单集
打开视频页 → 面板自动解析 → 点击下载链接（高级模式）或右键另存为（兼容模式）。

### 批量下载合集
在含合集（`ugc_season`）的视频页点击 **「批量下载合集」**。

### 批量下载 UP 主全部视频
在该 UP 主任一视频页点击 **「批量下载该UP主全部视频」**。扩展会按 30 条/页遍历 `x/space/arc/search`，集齐后开始逐集下载。

**速度档**（`localStorage.bilibili_helper_batch_delay`，默认 3s/集）：快速 1s / 标准 3s / 保守 6s / 最稳 12s。越慢越不易触发风控。

## 风控与安全设计（R3 语义）

为降低触发 B 站风控（`-799 请求过于频繁` / HTTP 412 / `-352` / `-403`）的概率，扩展内置以下行为约束：

| 约束 | 实现 |
|------|------|
| 分页间隔 | 每页 `1500–2300ms` 随机间隔 |
| `-799`/网络异常退避 | 有界递增退避：最多 4 次，每次 `8+rt*4`s + `0–3s` 抖动（约 12/16/20/24/27s）后继续分页 |
| 兜底策略 | 退避耗尽后按已抓页返回 `partial` 或空列表，**绝不**退化为单条目批量（已移除 `top/arc` 单条回填） |
| 上限 | 最多遍历 `t>=40` 页 |
| 去重 | `seen` Set 按 `bvid` 去重 |
| 零抛错 | 列表腿不向上抛错，统一走 partial 降级 |
| 批量节奏 | 每集 `delay + jitter`，连续失败 `>=2` 自动延长至 `delay*3` |
| 持久化 | `bilibili_helper_batch_done` 记录已完成 `cid`，支持跳过 |

> **注意**：正常使用节奏下不主动触发风控。批量下载仍受 B 站服务端配额影响，请合理控制频率，勿短时间连续大批量。

## 验证（可复跑证据）

仓库内置零网络确定性验证门：

```bash
node --check bilibili-helper-content-script.js   # 语法
node evidence/verify-u1-bxd.mjs                  # 28 项 harness（静态+重放+预算场景）
node evidence/acceptance.mjs                     # 16 项验收门（R1/R2/R3）
```

`evidence/` 目录保留了真实抓包与全量扫描的轻量证据（view/pagelist/playurl/byte 各 1158/1158，risk=0）。详见 `docs/`。

## 目录结构

```
├── manifest.json                        # MV3 清单
├── bilibili-helper-content-script.js    # 主内容脚本（解析/下载/批量逻辑）
├── bilibili-helper-content-script-seed.js # 注入引导
├── ffmpeg-*.js / .wasm                  # ffmpeg wasm 音视频合并
├── popup.html / icon.png                # 弹窗与图标
├── evidence/                            # 可复跑验证证据 + harness
└── docs/                                # 文档站（GitHub Pages / 静态）
```

## 文档 / Wiki

- **文档站（即项目 Wiki）**：<https://smith-106.github.io/bilibili-helper/> —— 托管 `docs/` 全部页面。
- Wiki 索引：[docs/WIKI.md](./docs/WIKI.md)；知识库/决策记录（kg）：[docs/KNOWLEDGE.md](./docs/KNOWLEDGE.md)。

> GitHub 独立 `.wiki.git` 需网页端手动建首页才生成（无 API 接口），故本项目以「文档站即 Wiki」：Wiki 内容在 `docs/` 随版本控制，等价且可评审。

## 变更日志

见 [`CHANGELOG.md`](./CHANGELOG.md)。

## 许可与免责声明

仅供学习与技术研究。请遵守 B 站服务条款与相关版权法规，勿用于侵犯版权的用途。下载内容仅限个人合法使用。
