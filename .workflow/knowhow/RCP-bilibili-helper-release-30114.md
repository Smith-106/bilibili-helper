---
title: bilibili-helper名单还没写完也先记住这一集发布v3.0.114
category: recipe
createdBy: dsh-agent
sourceRef: "commit:b90ed92,tag:v3.0.114,repo:Smith-106/bilibili-helper"
---
v3.0.113 在下载前把这一集写入 sessionStorage 再 qSave。页面若在这次写入完成前被硬关掉，sessionStorage 随标签消失，重试仍会把两份叠在一起。v3.0.114 在那之前先同步写一条 bhnmnow。读取时只要这条记录等于当前集或去掉三位序号后的名字，就分开保存。合成成功会清掉 bhnmnow。合并仿真 W46：会话写入直接抛错，第一份再抛错，页面记录里已有 bhnmnow；清掉会话和内存标记后再下，不合并，说明含上次在页面里放不下。62 项。分开保存仿真仍是 9 项，verify 102，selfcheck 全绿。残留：两份已经是字节块且两倍预留仍放得下时，两份和结果仍要同时留在页面里才能合成；这条最短记录还没写上就被关掉，仍然记不住；短标记也放不下时，最旧的仍会被丢掉；多轨、加密的仍是两个文件。
