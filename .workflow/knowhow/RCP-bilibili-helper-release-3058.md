---
title: bilibili-helper下载小块整理成一份后直接合并发布v3.0.58
category: recipe
createdBy: dsh-agent
sourceRef: "commit:50c4c1e,tag:v3.0.58,repo:Smith-106/bilibili-helper"
---
o0 原先 return new Blob(K)，K 是下载分块。t0 再 arrayBuffer() 抄成 Uint8Array。大文件在这一步同时持有全部分块和整段副本，页面被撑死，用户看到卡住就重试，重试仍走同一条复制。v3.0.58 在 o0 末尾把分块 set 进一份 Uint8Array，每块复制后 K[ci]=null，每 16 块让出一次主线程，u.size=u.byteLength 后返回。进度回调第三参是「正在整理已下载的数据，请勿重试」，单集和批量的进度回调都先显示这句。t0 见到 instanceof Uint8Array 就直接交给 qM，不再 arrayBuffer()。断点续传逻辑没改。仿真 T1 断言结果是 Uint8Array、size 为 4、字节 abcd，并且出现整理提示；T2/T3 续传字节仍正确。10 项，verify 102，selfcheck 全绿。残留：两份文件同时留在内存里才能合并；多轨、加密、超过 1200MB 的仍不是一个 mp4。
