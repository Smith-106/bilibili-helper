---
title: bilibili-helper收尾时不再整行重画发布v3.0.178
category: recipe
createdBy: dsh-agent
sourceRef: "commit:53421fd,tag:v3.0.178,repo:Smith-106/bilibili-helper"
---
成功和失败收尾原先 p.innerHTML 重画整行。下载链接先被拿掉，再从 mergeSaves 放回。v3.0.178 有 .b-ep 时只改 .b-st。已经有 a[download] 就不再重放。没有 querySelector 或没有集名时仍用原来的模板，Qs 仍是 q.mergeNote&&Qs++。117 项，verify 102，selfcheck 全绿。残留：还没进入点击处理就被关掉，仍然记不住；有的浏览器挪走时内部仍会复制一次；有的浏览器仍会先把各段攒齐再做成文件；加密标记如果在媒体数据 32KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。这一段本身没超过门槛时，送出后浏览器仍可能把它和结果同时留着。有的浏览器取回文件时仍会把整份读进页面。音频段的引用在做成之前仍会和结果里的那份同时留着。超过约十分钟还没点保存，链接仍会失效。没有集名的那一行收尾时仍会整行重画。
