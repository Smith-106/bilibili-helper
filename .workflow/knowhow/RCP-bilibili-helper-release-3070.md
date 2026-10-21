---
title: bilibili-helper页面已满时先保存再下另一份发布v3.0.70
category: recipe
createdBy: dsh-agent
sourceRef: "commit:e462795,tag:v3.0.70,repo:Smith-106/bilibili-helper"
---
两份都低于 jsMergeMax 时，v3.0.69 仍会把两份同时留在 got 里再 qM。页面堆已经比较满时，第二份一下来就撑死，重试还是同时留下。v3.0.70 在 t0 的 n>0 且 got 里已有一份时看 globalThis.performance.memory：usedJSHeapSize 超过 jsHeapSizeLimit 的 0.7，就先 a0 保存并清空 got，mergeWhy 为「页面已经比较满，先保存这一份再下另一份」，然后 streamOnly 下另一份。两份都已经在页面里时，合并前同样判断，直接 split「不再把两份放在一起」，不进 qM，也不进 ffmpeg。没有 performance.memory 的环境 heapTight 为假，原来的合并不变。合并仿真 W15 把 used/limit 设为 80/100，断言第二份开始前已保存 1 个、最终 2 个且不进合并。32 项，verify 102，selfcheck 全绿。残留：浏览器不提供 performance.memory 时无法提前感知；两份都放得下且页面有空时仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
