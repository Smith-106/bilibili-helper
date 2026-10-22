---
title: bilibili-helper单集一点击就先记一笔发布v3.0.166
category: recipe
createdBy: dsh-agent
sourceRef: "commit:a6e8cc1,tag:v3.0.166,repo:Smith-106/bilibili-helper"
---
单集合并下载原先在 querySelector 和禁用开关之后，才在传给 t0 的参数里写 bhx=*。这一段被关掉时下次仍会合成。v3.0.166 在 disabled 判断之后立刻写 bhnmpend=*。正式 bhx 写好后擦掉。不合并的链接在调用 R 之前立刻擦掉，避免下一集被误分开。105 项，verify 102，selfcheck 全绿。残留：还没进入点击处理就被关掉，仍然记不住；有的浏览器挪走时内部仍会复制一次；有的浏览器仍会先把各段攒齐再做成文件；加密标记如果在媒体数据 32KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。这一段本身没超过门槛时，送出后浏览器仍可能把它和结果同时留着。有的浏览器取回文件时仍会把整份读进页面。
