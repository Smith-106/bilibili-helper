---
title: bilibili-helper页面记录能留下不止一集发布v3.0.108
category: recipe
createdBy: dsh-agent
sourceRef: "commit:901297e,tag:v3.0.108,repo:Smith-106/bilibili-helper"
---
v3.0.107 在 localStorage 完全写不下时，只把最近这一集写进 document.cookie 的 bhnm。再失败一集就会盖掉前一集，前一集重试又把两份叠在一起。v3.0.108 用换行把多集记在同一条 bhnm 里，编码后超过 1800 就从最旧的丢掉。读取时任一集对上就分开保存。合成成功只从记录里删掉这一集，其他集还留着。合并仿真 W40：030甲 和 030乙 都失败后，记录里两集都在；清掉会话名单再下 030甲，不合并，说明含上次在页面里放不下。W39 只有一集时的记录格式不变。56 项，verify 102，selfcheck 全绿。残留：两份已经是字节块且两倍预留仍放得下时，两份和结果仍要同时留在页面里才能合成；页面记录太长时最旧的集仍会被丢掉；多轨、加密的仍是两个文件。
