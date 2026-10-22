---
title: bilibili-helper失败行盖掉后仍能放回下载链接发布v3.0.173
category: recipe
createdBy: dsh-agent
sourceRef: "commit:1a87d38,tag:v3.0.173,repo:Smith-106/bilibili-helper"
---
失败行有下载链接时，原先 failLog、failItems、bx7 写在 else 逗号表达式里，有链接就不会记入失败名单，点重试失败的不会再下这一集。行被 innerHTML 盖掉时，单独保存的链接也没了，因为没进 mergeSaves。v3.0.173 单独保存成功后记下 q.mergeSaves。失败行无论有没有链接都记入失败名单。没有链接时按 mergeSaves 把「保存 文件名」放回去，然后清空 mergeSaves，避免下一集带上。112 项，verify 102，selfcheck 全绿。残留：还没进入点击处理就被关掉，仍然记不住；有的浏览器挪走时内部仍会复制一次；有的浏览器仍会先把各段攒齐再做成文件；加密标记如果在媒体数据 32KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。这一段本身没超过门槛时，送出后浏览器仍可能把它和结果同时留着。有的浏览器取回文件时仍会把整份读进页面。音频段的引用在做成之前仍会和结果里的那份同时留着。
