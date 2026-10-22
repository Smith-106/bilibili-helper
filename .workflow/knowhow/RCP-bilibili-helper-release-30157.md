---
title: bilibili-helper浏览器不报告内存时按已写字节停下发布v3.0.157
category: recipe
createdBy: dsh-agent
sourceRef: "commit:41a4ac8,tag:v3.0.157,repo:Smith-106/bilibili-helper"
---
v3.0.155 只在 performance.memory.jsHeapSizeLimit 存在且超过七成时中途停下。不报告内存的浏览器会一直 enqueue。v3.0.157 用 sent 累加已送出的 byteLength 或 size。没有 jsHeapSizeLimit 时，每 8 段比较 sent。设了 mergeHold 或 holdMax，就用该值的十六分之一；都没设就用 8MB。超过就写「页面已经较满，这一段停下，点重试会分开保存」并抛 out of memory。外层仍按原件是否还在决定当场分开还是等重试。开始前的 room 在不报告内存且没设上限时已经拒绝整份合成，8MB 是兜底。97 项，verify 102，selfcheck 全绿。残留：按下的这一句还没执行就被关掉，仍然记不住；有的浏览器挪走时内部仍会复制一次；有的浏览器仍会先把各段攒齐再做成文件；加密标记如果在媒体数据 32KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。不报告内存时，没超过 8MB 或上限的十六分之一，中途仍不会停。
