---
title: bilibili-helper取回文件前先放开音频发布v3.0.164
category: recipe
createdBy: dsh-agent
sourceRef: "commit:e8186cc,tag:v3.0.164,repo:Smith-106/bilibili-helper"
---
OPFS 写完后原先是 jm=await fh.getFile() 再 audioU=null。读回整份文件时音频原件还在，峰值是两份。v3.0.164 先 audioU=null 并让出一个宏任务，状态写成「原件已放开，正在取回文件」，再 getFile。103 项，verify 102，selfcheck 全绿。残留：按下的这一句还没执行就被关掉，仍然记不住；有的浏览器挪走时内部仍会复制一次；有的浏览器仍会先把各段攒齐再做成文件；加密标记如果在媒体数据 32KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。这一段本身没超过门槛时，送出后浏览器仍可能把它和结果同时留着。有的浏览器取回文件时仍会把整份读进页面。
