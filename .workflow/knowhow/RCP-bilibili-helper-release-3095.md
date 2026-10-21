---
title: bilibili-helper合并前先记住这一集发布v3.0.95
category: recipe
createdBy: dsh-agent
sourceRef: "commit:e6519cf,tag:v3.0.95,repo:Smith-106/bilibili-helper"
---
v3.0.94 只在 split 时写 sessionStorage。qM 或拷贝把页面直接关掉时，split 没跑到，刷新后再下仍把两份叠在一起。v3.0.95 在 videoU/audioU 拷贝和 qM 之前写入 bilibili_helper_nomerge。合成成功并 a0 保存之后 delete m0[o] 再写回，同时删掉 q.noMerge[o]。失败或页面关掉则记录留着，下次 t0 开头读到就 streamOnly。合并仿真 W25：分配失败后键里还有这一集；另一集合成成功后键里没有它，且只保存一个 mp4。42 项，verify 102，selfcheck 全绿。残留：两份都比较小且合并没有把页面关掉时，仍要同时留着才能合成；多轨、加密的仍是两个文件。
