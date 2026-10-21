---
title: bilibili-helper同一集再次下载不再叠在一起发布v3.0.93
category: recipe
createdBy: dsh-agent
sourceRef: "commit:fa6487b,tag:v3.0.93,repo:Smith-106/bilibili-helper"
---
分开保存之后，用户在同一页再点这一集，t0 仍会把两份下进页面再试 qM。内存失败就会再走一遍。v3.0.93 在 split 里记 q.noMerge[o]=1。下次 t0 看到这个名字就 streamOnly，并把说明设成「这一集上次在页面里放不下，这次分开保存」。只记在这一页的 q 上，不进 localStorage，刷新后会再试合成。合并仿真 W23：第一次分配失败并分开，第二次不再合并，说明含上次在页面里放不下。40 项，verify 102，selfcheck 全绿。残留：第一次仍可能在记住之前把两份叠在一起；刷新后会再试一次。多轨、加密的仍是两个文件。
