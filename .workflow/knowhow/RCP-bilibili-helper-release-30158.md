---
title: bilibili-helper每一段送出前都看大小发布v3.0.158
category: recipe
createdBy: dsh-agent
sourceRef: "commit:e85846f,tag:v3.0.158,repo:Smith-106/bilibili-helper"
---
v3.0.157 每 8 段才看内存或已写字节。普通 mp4 常常只有头、视频、音频三大段，检查根本不会发生，一段很大的数据会直接 enqueue。v3.0.158 在每一段送出前计算 n。有 jsHeapSizeLimit 时，usedJSHeapSize+n 超过七成就停。没有时，sent+n 超过 mergeHold 或 holdMax 的十六分之一就停，都没设则 8MB。停的提示仍是「页面已经较满，这一段停下，点重试会分开保存」。每 8 段仍 setTimeout(0)。97 项，verify 102，selfcheck 全绿。残留：按下的这一句还没执行就被关掉，仍然记不住；有的浏览器挪走时内部仍会复制一次；有的浏览器仍会先把各段攒齐再做成文件；加密标记如果在媒体数据 32KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。这一段本身没超过门槛时，送出后浏览器仍可能把它和结果同时留着。
