---
title: bilibili-helper名单写不下时仍记住这一集发布v3.0.105
category: recipe
createdBy: dsh-agent
sourceRef: "commit:36126f9,tag:v3.0.105,repo:Smith-106/bilibili-helper"
---
分开保存的名单写入 localStorage 失败时，旧代码直接吞掉错误。这一集等于没记住，重试会再把两份叠在一起，再次出现 memory access out of bounds。v3.0.105 在下第二份前、合并前和分开保存时，setItem 失败后只写入当前集名和去掉三位序号后的名字，再试一次。合并仿真 W37：原名单含 OLD，整份写入会抛 QuotaExceededError，退路写入 026额 且不再含 OLD。53 项，verify 102，selfcheck 全绿。残留：两份已经是字节块且两倍预留仍放得下时，两份和结果仍要同时留在页面里才能合成；整份写不下时，名单里其他集的记录会被这一次覆盖，那些集下一次可能再试一次合并；多轨、加密的仍是两个文件。
