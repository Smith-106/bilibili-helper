---
title: bilibili-helper加密时写明原因发布v3.0.121
category: recipe
createdBy: dsh-agent
sourceRef: "commit:b0cf254,tag:v3.0.121,repo:Smith-106/bilibili-helper"
---
页面内合并不会解开加密。以前 moov 里有 sinf、enca、encv 或 schm 时，分开保存仍说「结构未识别」。v3.0.121 在确认两边都有 moov 之后，只扫 moov 这几段，对上就返回。视频这边对上写「视频已加密」，否则写「音频已加密」。这句进入「已分开保存音视频（原因）」，不进 ffmpeg。合并仿真 F7：视频 moov 里放一个 sinf，音频是普通一条轨道，结果是 null，原因是视频已加密。69 项，verify 102，selfcheck 全绿。残留：三份预留仍放得下时，两份和结果仍要同时留在页面里才能合成；新记录的赋值还没执行就被关掉，仍然记不住。加密标记若只出现在媒体数据里、不在 moov 里，仍不会被认成加密。
