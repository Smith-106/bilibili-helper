---
title: bilibili-helper仓库清理与文档站发布v3.0.299
category: recipe
createdBy: dsh-agent
sourceRef: "commit:8cdd3e1,tag:v3.0.299,repo:Smith-106/bilibili-helper"
---
删掉本地 260 个已发布安装包（约 28MB）和 maestro 向量索引、会话、恢复记录、搜索缓存。这些本来就不进 git。修好 DCS-bilibili-helper-error-fix-3035 的标题引号，maestro 可以再读这条。ffmpeg-core.wasm 仍留在仓库，发布包不带它。GitHub Releases 里的旧安装包不删。下载行为不变，仿真仍为 236 项，verify 102，selfcheck 全绿。旧知识条目标记为 legacy-free-category，工具拒绝自动改分类，所以没有批量改写。
