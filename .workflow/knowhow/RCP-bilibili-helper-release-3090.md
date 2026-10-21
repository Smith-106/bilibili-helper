---
title: bilibili-helper合并前再留一份会过满时分开保存发布v3.0.90
category: recipe
createdBy: dsh-agent
sourceRef: "commit:ee10695,tag:v3.0.90,repo:Smith-106/bilibili-helper"
---
v3.0.89 只在下另一份前把下一份的预告大小加进 0.7 判断。两份都已经在页面里、used 还没到 0.7 时，qM 仍会再做出一份结果，峰值跨过上限后页面死掉，重试再做一次。v3.0.90 把 heldNow 提前算好，heapTight 改为 usedJSHeapSize+heldNow > limit*0.7。heldNow 只加 byteLength 或 Blob.size，不看普通对象的假 size。合并仿真 W21：已用 60、上限 100、两份各 8 字节，分开保存且说明含不再把两份放在一起，不进 wasm。W1 小文件仍合并。38 项，verify 102，selfcheck 全绿。残留：两份真实字节加已用空间仍低于七成时，还是要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
