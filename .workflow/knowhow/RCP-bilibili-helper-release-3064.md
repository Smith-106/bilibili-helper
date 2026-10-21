---
title: bilibili-helper拼不成一整块时直接保存已下载小块发布v3.0.64
category: recipe
createdBy: dsh-agent
sourceRef: "commit:9f0145b,tag:v3.0.64,repo:Smith-106/bilibili-helper"
---
o0 末尾 new Uint8Array(total) 会在大文件上抛 RangeError: Array buffer allocation failed。异常冒出后这一集失败，用户重试仍走同一条拼装，结果一样。v3.0.64 捕获 allocation failed、Invalid array length、out of memory，改返回 {noHold:true,size,blob}，blob 是 new Blob(K)，不要求再分配一整块连续内存。测试开关 o0.forceNoHold 走同一条。t0 见到 m.noHold 先把 got 里已有的存掉，再 a0(m.blob)，原因句是「这一份太大，页面里留不住一整块，已直接保存」。单集 R 在保存前 if(r&&r.noHold)r=r.blob，避免把包装对象存成废文件。续传仿真 T6 断言字节仍是 abcd。合并仿真 W9 断言第二份开始时已经保存了 1 个文件且不进合并。11 项和 26 项，verify 102，selfcheck 全绿。残留：两份都放得下连续内存的仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
