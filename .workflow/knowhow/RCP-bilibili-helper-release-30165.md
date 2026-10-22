---
title: bilibili-helper按下的第一句就先记一笔发布v3.0.165
category: recipe
createdBy: dsh-agent
sourceRef: "commit:06d9ad5,tag:v3.0.165,repo:Smith-106/bilibili-helper"
---
pointerdown 里原先先生成随机编号，再写 bhx。编号和正式标记之间被关掉时，下次仍会合成。v3.0.165 在两个判断之后立刻写 bhnmpend=*，再写正式 bhx，然后擦掉 bhnmpend。松开没点中也会擦掉。下次 t0 看到 bhnmpend=* 就分开保存，并马上清掉，所以只影响下一集。仿真把这笔放进 cookie 后，049笔分成两个文件，cookie 被清掉。104 项，verify 102，selfcheck 全绿。残留：还没进入按下处理就被关掉，仍然记不住；有的浏览器挪走时内部仍会复制一次；有的浏览器仍会先把各段攒齐再做成文件；加密标记如果在媒体数据 32KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。这一段本身没超过门槛时，送出后浏览器仍可能把它和结果同时留着。有的浏览器取回文件时仍会把整份读进页面。
