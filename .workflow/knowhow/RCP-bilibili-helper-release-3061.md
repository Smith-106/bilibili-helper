---
title: bilibili-helper两份合计超过1200MB时下完一份就保存发布v3.0.61
category: recipe
createdBy: dsh-agent
sourceRef: "commit:e6bf622,tag:v3.0.61,repo:Smith-106/bilibili-helper"
---
v3.0.59 只是排队下载，两份下完后仍同时留在 got 里。接口 size 加总超过 jsMergeMax（默认 1200MB）时，页面会在分开保存之前被两份一起撑死，重试还是先堆两份。v3.0.61 在循环前把 d 里的 size 加总，超过上限则 streamOnly：每份 await a0 后 continue，不 got.push。音频存 _音频.m4a，视频存 _视频.mp4。mergeNote 为「已分开保存音视频（两份加起来太大，不能同时放在页面里）」。体积未知或加总不超过上限时仍两份都留下再在页面内合并。仿真 W7 把 jsMergeMax 设为 10、两份 size 各 8，断言第二份开始下载时已经保存了 1 个文件，且最终是音频再视频两个文件、merges 为 0。sim-qm 24 项，verify 102，selfcheck 全绿。残留：加总不超过 1200MB 的仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
