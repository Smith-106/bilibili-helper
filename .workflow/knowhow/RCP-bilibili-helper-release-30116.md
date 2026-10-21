---
title: bilibili-helper翻名单之前就已经记住发布v3.0.116
category: recipe
createdBy: dsh-agent
sourceRef: "commit:9abe3b0,tag:v3.0.116,repo:Smith-106/bilibili-helper"
---
v3.0.115 把 bhnmnow 写在 await qDbRead 之前，但仍在读完会话名单和三十条 qRead 之后。翻这些名单时页面被关掉，这条最短记录还没写上。v3.0.116 算出集名后立刻读上一次的 bhnmnow 到 quick，马上再写这一次，然后才读 sessionStorage、localStorage 和 qRead。不能先写后读，否则这次刚写的会被当成上次没放下。合并仿真 W48：会话读取会抛错，页面记录的写入发生在这次读取之前；第一份下载失败后，清掉会话和内存标记再下，不合并，说明含上次在页面里放不下。64 项，verify 102，selfcheck 全绿。残留：两份已经是字节块且两倍预留仍放得下时，两份和结果仍要同时留在页面里才能合成；上一条还没看完就被关掉，这一次新的记录仍写不上；短标记也放不下时，最旧的仍会被丢掉；多轨、加密的仍是两个文件。
