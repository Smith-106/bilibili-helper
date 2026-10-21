---
title: bilibili-helper保存已收到部分时仍留着权限失效发布v3.0.88
category: recipe
createdBy: dsh-agent
sourceRef: "commit:a9e2975,tag:v3.0.88,repo:Smith-106/bilibili-helper"
---
第五次失败且已经收到字节、又有文件夹时，o0 用 new Error 包一层「已保存已收到的部分，点重试会接着下」。新 Error 没有原来的 name。v3.0.87 的 bxShown 只看 name，于是 NotAllowedError 变成普通英文，R/t0 也不再清掉坏掉的文件夹，重试还是同一句。v3.0.88 在抛出前把 G.name 抄到新错误上。续传仿真 T23：读到 ab 后权限失效，五次后错误名仍是 NotAllowedError，说明里仍有接着下。28 项，verify 102，selfcheck 全绿。残留：两份都小于约 128MB 且页面有空时仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
