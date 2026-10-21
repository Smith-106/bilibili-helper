---
title: bilibili-helper本地名单写不下时记在页面里发布v3.0.107
category: recipe
createdBy: dsh-agent
sourceRef: "commit:09f2cf8,tag:v3.0.107,repo:Smith-106/bilibili-helper"
---
qSave 把名单里的旧名字都丢掉之后，如果 localStorage 连当前集一个名字都写不进去，关掉页面后这次失败就忘了，重试会再把两份叠在一起。v3.0.107 这时把去掉三位序号后的名字写入 document.cookie 的 bhnm，最多 80 个字，30 天。下次读取时名字对上，就按分开保存，说明仍是「这一集上次在页面里放不下」。合成成功后清掉这条记录。合并仿真 W39：setItem 和 removeItem 都抛错，页面记录含 bhnm 和 028记；清空会话名单后再下，不合并，说明含上次在页面里放不下。55 项，verify 102，selfcheck 全绿。残留：两份已经是字节块且两倍预留仍放得下时，两份和结果仍要同时留在页面里才能合成；页面记录只留最近这一集；多轨、加密的仍是两个文件。
