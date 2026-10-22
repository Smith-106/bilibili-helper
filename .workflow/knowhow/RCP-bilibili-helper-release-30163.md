---
title: bilibili-helper合集进度也写到总状态发布v3.0.163
category: recipe
createdBy: dsh-agent
sourceRef: "commit:5321d0c,tag:v3.0.163,repo:Smith-106/bilibili-helper"
---
合成和写入时的句子原先只写到这一集的进度元素 a.innerHTML。合集上方的总状态不动，长集看起来像卡住。v3.0.163 用 say 同时写 a 和 #batch-status，并记下 bx0.lastStatus。bx0.cancel 为真时直接返回，不盖掉「已请求取消」。102 项，verify 102，selfcheck 全绿。残留：按下的这一句还没执行就被关掉，仍然记不住；有的浏览器挪走时内部仍会复制一次；有的浏览器仍会先把各段攒齐再做成文件；加密标记如果在媒体数据 32KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。这一段本身没超过门槛时，送出后浏览器仍可能把它和结果同时留着。从临时目录取回文件时，仍可能把整份读进页面。
