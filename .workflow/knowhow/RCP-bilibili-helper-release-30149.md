---
title: bilibili-helper逐段做成文件并放开已写入的一段发布v3.0.149
category: recipe
createdBy: dsh-agent
sourceRef: "commit:db61c4d,tag:v3.0.149,repo:Smith-106/bilibili-helper"
---
v3.0.146 挪走之后仍 new Blob(owned)，整份和结果同时在。v3.0.149 在有 ReadableStream 和 Response 时，pull 里先把 owned[i] 置空再 enqueue，然后 Response.blob()。没有流时才 new Blob(owned)。页面写「原件已放开，正在逐段做成文件，若卡住请点重试，重试会分开保存」。合并仿真 W1 确认成品里仍有视频和音频。91 项，verify 102，selfcheck 全绿。残留：按下批量下载的这一句还没执行就被关掉，仍然记不住；有的浏览器挪走时内部仍会复制一次；有的浏览器仍会先把各段攒齐再做成文件；加密标记如果在媒体数据 16KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。
