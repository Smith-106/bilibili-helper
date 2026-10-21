---
title: bilibili-helper断点记在本机关掉页面后仍接着下发布v3.0.74
category: recipe
createdBy: dsh-agent
sourceRef: "commit:e08c268,tag:v3.0.74,repo:Smith-106/bilibili-helper"
---
v3.0.73 的 q.partial 只活在当次页面。页面被内存错误关掉后，重试从头再下，createWritable 还会把已经写到文件夹里的半截文件截断。v3.0.74 在记下 q.partial 时写入 localStorage 键 bilibili_helper_partial，清掉 partial 时删除该键。下次 o0 发现页面里没有 partial、但 partialName 和记录里的文件名相同，就恢复 bytes 并从这个位置发 Range。续传仿真 T13 不设置 q.partial，只放本机记录 {name:v.mp4,bytes:2}，断言请求头是 bytes=2-、只写下 cd、seek 到 2，下完后记录被删。18 项，verify 102，selfcheck 全绿。残留：没选同一个文件夹时磁盘上的半截文件对不上；两份都放得下且页面有空时仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
