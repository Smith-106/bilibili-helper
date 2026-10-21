---
title: bilibili-helper不报告剩余空间时大文件不再叠放发布v3.0.78
category: recipe
createdBy: dsh-agent
sourceRef: "commit:ae7685c,tag:v3.0.78,repo:Smith-106/bilibili-helper"
---
v3.0.70 的 70% 堆判断依赖 performance.memory。很多页面没有这个接口，两份只要没超过 jsMergeMax（1200MB）就同时留在 got 里再 qM，标签页会被撑死，重试仍同时留下。v3.0.78 在没有 jsHeapSizeLimit 时，只累计真正的 Uint8Array.byteLength 或 Blob.size。已在页面里的这一份超过 q.wasmSkip（默认 400MB），下另一份之前先保存，原因句是「浏览器不报告剩余空间，这一份已经较大，先保存再下另一份」。两份加起来也超过这个值时设置 mergeWhy 再 split，原因句是「两份加起来已经较大」。只有虚假 size、不是字节块的对象不触发，所以原有「超过 400MB 仍页面内合并」的仿真不受影响。合并仿真 W17、W18。35 项，verify 102，selfcheck 全绿。残留：两份都小于约 400MB 且页面有空时仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
