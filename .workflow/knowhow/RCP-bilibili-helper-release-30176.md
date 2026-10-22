---
title: bilibili-helper合集进度不再盖掉这一集的名字发布v3.0.176
category: recipe
createdBy: dsh-agent
sourceRef: "commit:1eaa8a5,tag:v3.0.176,repo:Smith-106/bilibili-helper"
---
say 原先 if(a)a.innerHTML=t。合集这一行 a 就是带 .b-ep 的 li，每句进度都把集名、序号和已经放上的下载链接盖掉。v3.0.176 有 .b-ep 时只追加或更新 .b-say。没有集名的单集进度仍用 innerHTML。总状态 #batch-status 照旧。115 项，verify 102，selfcheck 全绿。残留：还没进入点击处理就被关掉，仍然记不住；有的浏览器挪走时内部仍会复制一次；有的浏览器仍会先把各段攒齐再做成文件；加密标记如果在媒体数据 32KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。这一段本身没超过门槛时，送出后浏览器仍可能把它和结果同时留着。有的浏览器取回文件时仍会把整份读进页面。音频段的引用在做成之前仍会和结果里的那份同时留着。超过约十分钟还没点保存，链接仍会失效。成功或失败收尾时这一行仍会按原来的模板重画一次。
