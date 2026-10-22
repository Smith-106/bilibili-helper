---
title: bilibili-helper能挪走时不再复制一份发布v3.0.146
category: recipe
createdBy: dsh-agent
sourceRef: "commit:fa179c9,tag:v3.0.146,repo:Smith-106/bilibili-helper"
---
v3.0.145 用 slice 复制，复制视频时原件和副本同时在。v3.0.146 对同一块 buffer 只 transfer 一次，按原来的 byteOffset 和长度重新做成小块。先挪视频，放开 videoU 并等一次，再挪音频，放开 audioU，再做成文件。transfer 不存在或抛错时才 slice。合并仿真 W1 确认挪走之后成品里仍有视频和音频。88 项，verify 102，selfcheck 全绿。残留：运行批量的这一句还没执行就被关掉，仍然记不住；有的浏览器挪走时内部仍会复制一次；做成文件的那一下，挪走的那份和结果仍同时在；加密标记如果在媒体数据 4KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。
