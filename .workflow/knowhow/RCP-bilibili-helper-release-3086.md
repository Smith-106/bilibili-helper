---
title: bilibili-helper文件夹权限失效时丢掉它发布v3.0.86
category: recipe
createdBy: dsh-agent
sourceRef: "commit:cbfee35,tag:v3.0.86,repo:Smith-106/bilibili-helper"
---
v3.0.84 和 v3.0.85 选到文件夹后一直留着 q.dir。权限失效时 createWritable 抛 NotAllowedError 或 SecurityError，重试仍用这个坏句柄，所以还是同一句失败，也不会再弹选择。v3.0.86 在 R 和 t0 的循环里认出这两种错误，把 q.dir 和 q.dirAsked 清掉。同一次里已经问过就不再弹，把错误抛出去。下次重试因为没有文件夹，会重新请用户选。续传仿真 T22：先 needDir 并选择一次，第二次 NotAllowedError，断言文件夹和 dirAsked 都已清掉。27 项，合并仿真 36 项仍过，verify 102，selfcheck 全绿。残留：两份都小于约 128MB 且页面有空时仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
