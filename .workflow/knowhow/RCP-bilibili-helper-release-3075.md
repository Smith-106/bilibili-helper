---
title: bilibili-helper按文件名分别记住断点发布v3.0.75
category: recipe
createdBy: dsh-agent
sourceRef: "commit:0083848,tag:v3.0.75,repo:Smith-106/bilibili-helper"
---
v3.0.74 的 bilibili_helper_partial 只存一条 {name,bytes}。批量里下一集失败会覆盖上一集，重试上一集时从 0 开始并 createWritable 截断已经留下的半截文件，长视频再次整份进页面。v3.0.75 把这个键改成「文件名 → 已收字节」。partRead 仍接受旧的单条格式。失败只更新当前 partialName。下完或 416 只 delete 当前文件名，表空了才 removeItem。续传仿真 T13 旧格式仍能接着下并在下完后删键。T14 同时有 a.mp4=2 和 b.mp4=5，下完 a 之后 b 仍是 5。19 项，verify 102，selfcheck 全绿。残留：没选同一个文件夹时磁盘上的半截文件对不上；两份都放得下且页面有空时仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
