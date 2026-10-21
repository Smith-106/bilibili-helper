---
title: bilibili-helper分开保存单独计数发布v3.0.44
category: recipe
createdBy: dsh-agent
sourceRef: "commit:e8e5ada,tag:v3.0.44,repo:Smith-106/bilibili-helper"
---
v3.0.42/43 把合并不了的集分开存成视频+音频, 但批量计数仍 Q0++, 结束语只写「成功 N」。用户会以为已经合成一个 mp4。v3.0.44 增加 Qs: 仅当 q.mergeNote 有值时 Qs++。进度和结束语用 ${Qs?" 分开"+Qs:""}, Qs 为 0 时与旧文案逐字相同, sim-up-batch 的 /成功8 跳过2/ 不回归。Qs>0 时结束语追加「其中分开保存的是视频和音频两个文件」。verify 100(A71), selfcheck 全绿。残留: 超过 700MB 或 wasm 仍 OOM 的集拿不到单个合并文件。
