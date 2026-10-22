---
title: bilibili-helper上一条还没看完也已经写下发布v3.0.118
category: recipe
createdBy: dsh-agent
sourceRef: "commit:1cc5490,tag:v3.0.118,repo:Smith-106/bilibili-helper"
---
v3.0.116 先读 bhnmnow 再写。读这条记录时页面被关掉，这一次的新记录还没写上，重试会再把两份叠在一起。v3.0.118 先写 bhx 加随机名，不覆盖旧记录。读的时候跳过自己刚写的这一条，其它 bhx 或 bhnmnow 对上这一集才分开保存。合成成功会清掉对得上的 bhx 和 bhnmnow。合并仿真 W50：第一次读页面记录就抛错，此时 bhx 已经在；页面很空，清掉会话和内存标记后再下，不合并，说明含上次在页面里放不下。66 项，verify 102，selfcheck 全绿。残留：三份预留仍放得下时，两份和结果仍要同时留在页面里才能合成；这条新记录的赋值还没执行就被关掉，仍然记不住；短标记也放不下时，最旧的仍会被丢掉；多轨、加密的仍是两个文件。
