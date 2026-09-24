---
title: 批量下载-799后只下1集：递增退避+移除top单条目兜底(v3.0.17)
category: bugfix
createdBy: pi-agent
sourceRef: "commit:b26e637,tag:v3.0.17,repo:Smith-106/bilibili-helper"
---
症状: UP主全部视频批量在 x/space/arc/search 命中 -799 后只下载1集。根因: 单次5–7s退避后落入 x/space/top/arc 兜底, 该接口只返回置顶1条, 批量坍缩为1。修复(U1第337行): -799/网络异常→有界递增退避≤4次(约12/16/20/24/27s)继续分页; 耗尽按已抓页返回partial/空; 移除top/arc单条目兜底进批量列表。约束: 分页1500–2300ms, t>=40上限, bvid去重, 零抛错partial降级。验证: node --check + verify-u1-bxd.mjs 28/28 + acceptance.mjs 16/16。文档: docs/KNOWLEDGE.md S1–S8, docs/WIKI.md. 发布: v3.0.17 + bilibili-helper-3.0.17.zip.