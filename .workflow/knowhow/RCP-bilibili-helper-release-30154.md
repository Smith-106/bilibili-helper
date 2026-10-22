---
title: bilibili-helper逐段做成文件时显示段数并让出发布v3.0.154
category: recipe
createdBy: dsh-agent
sourceRef: "commit:a2d0edc,tag:v3.0.154,repo:Smith-106/bilibili-helper"
---
v3.0.149 的流只写一句「正在逐段做成文件」。卡住时看不出走到哪一段，浏览器也可能把各段攒齐。v3.0.154 把 pull 改成 async。每一段先把状态写成「正在逐段做成文件 i/总数，若卡住请点重试，重试会分开保存」，再把 owned[i] 置空并 enqueue。每 8 段 await setTimeout(0)，让已经放开的段有机会被收掉。没有流时仍一次 new Blob。合并仿真 W1 确认成品里仍有视频和音频，W74 确认段数和让出。94 项，verify 102，selfcheck 全绿。残留：按下的这一句还没执行就被关掉，仍然记不住；有的浏览器挪走时内部仍会复制一次；有的浏览器仍会先把各段攒齐再做成文件；加密标记如果在媒体数据 16KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。
