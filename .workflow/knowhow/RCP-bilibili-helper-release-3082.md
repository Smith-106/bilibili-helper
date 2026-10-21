---
title: bilibili-helper不报告剩余空间时128MB以上不再叠放发布v3.0.82
category: recipe
createdBy: dsh-agent
sourceRef: "commit:805dafb,tag:v3.0.82,repo:Smith-106/bilibili-helper"
---
v3.0.78 在没有 performance.memory 时用 wasmSkip（400MB）决定是否把两份留在页面里。两份各三百多 MB 仍会叠在一起，重试同样叠。单份下完还会 new Uint8Array(total)，峰值再翻一倍。v3.0.82 把这条叠放上限改成 q.holdMax，默认 128MB，不再借用 wasmSkip。有 jsHeapSizeLimit 时仍用 0.7 的满载判断，所以浏览器报告了空间时，较大但仍有空的两份可以合成。o0 在拼整块前用同一个上限，超过则走已有的 Blob 路径。续传仿真 T19，合并仿真 W17、W18 改用 holdMax。24 项续传、35 项合并，verify 102，selfcheck 全绿。残留：两份都小于约 128MB 且页面有空时仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
