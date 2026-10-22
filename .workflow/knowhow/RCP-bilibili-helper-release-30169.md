---
title: bilibili-helper停在音频第一段时这段还没送出发布v3.0.169
category: recipe
createdBy: dsh-agent
sourceRef: "commit:94a426e,tag:v3.0.169,repo:Smith-106/bilibili-helper"
---
v3.0.168 用 made<cut 才保存音频。停下发生在 enqueue 之前，made 已经等于 cut 时，音频第一段还在 owned 里，却被丢掉。v3.0.169 改成 made<=cut。等于 cut 时整段音频还没送出，会写成 _音频.m4a。made>cut 表示前面的音频段已经送出，剩下的是残片，仍然不保存。108 项，verify 102，selfcheck 全绿。残留：还没进入点击处理就被关掉，仍然记不住；有的浏览器挪走时内部仍会复制一次；有的浏览器仍会先把各段攒齐再做成文件；加密标记如果在媒体数据 32KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。这一段本身没超过门槛时，送出后浏览器仍可能把它和结果同时留着。有的浏览器取回文件时仍会把整份读进页面。已经送出过至少一段音频后再停下，残片留不回来。
