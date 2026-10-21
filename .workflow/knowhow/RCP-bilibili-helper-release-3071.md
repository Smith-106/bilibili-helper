---
title: bilibili-helper页面已满时下完不再拼整块发布v3.0.71
category: recipe
createdBy: dsh-agent
sourceRef: "commit:83cc00f,tag:v3.0.71,repo:Smith-106/bilibili-helper"
---
v3.0.70 只在下另一份之前看堆。单份下完后仍 new Uint8Array(total)，把小块再拷成一整块。页面已用超过七成时，这一拷贝把页面撑死，重试还是再拷一次。v3.0.71 在 o0 分配前计算 heapTight：globalThis.performance.memory 的 usedJSHeapSize 超过 jsHeapSizeLimit 的 0.7 时，和 forceNoHold 一样抛出 Array buffer allocation failed，走已有的 Blob、再不行才小块的分支。没有 performance.memory 时仍拼整块。续传仿真 T11 把 used/limit 设为 80/100，断言返回 noHold Blob 且内容是 abcd，不是 Uint8Array。T1 在没有该对象时仍是整块。16 项，verify 102，selfcheck 全绿。残留：浏览器不提供 performance.memory 时无法提前感知；两份都放得下且页面有空时仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
