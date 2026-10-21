---
title: bilibili-helper单份超过上限时边下边写入文件夹发布v3.0.66
category: recipe
createdBy: dsh-agent
sourceRef: "commit:8530272,tag:v3.0.66,repo:Smith-106/bilibili-helper"
---
v3.0.65 仍先把整份收进 K 再决定怎么保存。单份超过页面能放下的大小时，下载过程本身就会撑死，重试还是整份进页面。v3.0.66 在 o0 每收到一块时看 globalThis.q：有 dir 和 spillTo，且已知总长或已收字节超过 jsMergeMax（默认 1200MB），就把已有小块和之后的小块直接 write，不再 push 进 K。下完返回 {noHold:true,streamed:true,size}，finally 里关闭写入。t0 和单集 R 在调用前用文件名设置 q.spillTo。原因句是「这一份超过页面能放下的大小，已边下边写入文件夹」。没选文件夹或不超过上限的仍走原来的内存路径并合并。续传仿真 T8 把上限设为 3 字节，断言两块各 2 字节被写入且关闭一次，返回 streamed。合并仿真 W12 断言这种结果不进合并、不产生点击保存。13 项和 29 项，verify 102，selfcheck 全绿。残留：没选文件夹的大文件仍要进页面；两份都放得下的仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
