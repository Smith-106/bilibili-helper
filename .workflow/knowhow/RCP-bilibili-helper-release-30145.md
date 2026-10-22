---
title: bilibili-helper先放开视频再复制音频发布v3.0.145
category: recipe
createdBy: dsh-agent
sourceRef: "commit:fbb6464,tag:v3.0.145,repo:Smith-106/bilibili-helper"
---
v3.0.143 一次性复制全部小块，视频、音频和整份副本同时在。v3.0.145 的 hold 结果带 vCut：普通 mp4 是 1 加视频块数，分片是视频块写完时的 pieces.length。调用方先复制到 vCut，放开 videoU 并等一次，再复制音频，放开 audioU，再等一次，然后 new Blob。页面先写「正在复制，若卡住请点重试，重试会分开保存」，放开后再写「原件已放开，正在做成文件」。直接调用 qM 且没设 deferBlob 时仍返回 Blob。合并仿真 87 项，W68 确认放开顺序，W69 确认两句进度。verify 102，selfcheck 全绿。残留：运行批量的这一句还没执行就被关掉，仍然记不住；复制视频的那一下，视频和它的副本仍同时在；做成文件的那一下，副本和结果仍同时在；加密标记如果在媒体数据 4KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。
