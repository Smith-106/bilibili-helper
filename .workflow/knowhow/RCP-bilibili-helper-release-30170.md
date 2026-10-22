---
title: bilibili-helper已经送出的音频段还能拼回来发布v3.0.170
category: recipe
createdBy: dsh-agent
sourceRef: "commit:998b6c1,tag:v3.0.170,repo:Smith-106/bilibili-helper"
---
内存流送出一段前会 owned[i]=null。停下时已经送出的音频段只留在失败的 Response 里，owned 里只剩残片。v3.0.170 在置空前 kept.push(p)，引用的是同一块内存，不是再复制一份。oom 且 made>cut 时，用 kept 里 cut 之后的段，加上 owned 里从 made 起还没送出的段，拼成 _音频.m4a。成功后 kept=null。109 项，verify 102，selfcheck 全绿。残留：还没进入点击处理就被关掉，仍然记不住；有的浏览器挪走时内部仍会复制一次；有的浏览器仍会先把各段攒齐再做成文件；加密标记如果在媒体数据 32KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。这一段本身没超过门槛时，送出后浏览器仍可能把它和结果同时留着。有的浏览器取回文件时仍会把整份读进页面。拼音频时如果浏览器已经把送出的那段复制进结果，页面里会短暂有两份引用。
