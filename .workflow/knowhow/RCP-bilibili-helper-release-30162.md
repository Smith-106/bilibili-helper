---
title: bilibili-helper写入文件夹时写完视频就放开发布v3.0.162
category: recipe
createdBy: dsh-agent
sourceRef: "commit:7fb671c,tag:v3.0.162,repo:Smith-106/bilibili-helper"
---
选了文件夹或写入 OPFS 时，旧循环把 jm.parts 全部 write 完才 videoU=null、audioU=null。视频和音频会一起留到最后。v3.0.162 按下标写。每一段写完就把 parts[i] 置空。状态是「正在写入文件夹 i/总数」或「正在写入浏览器文件夹 i/总数」。i+1 到达 vCut 就 videoU=null 并让出，再写音频。OPFS 在 getFile 之后只清 audioU。101 项，verify 102，selfcheck 全绿。残留：按下的这一句还没执行就被关掉，仍然记不住；有的浏览器挪走时内部仍会复制一次；有的浏览器仍会先把各段攒齐再做成文件；加密标记如果在媒体数据 32KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。这一段本身没超过门槛时，送出后浏览器仍可能把它和结果同时留着。getFile 仍可能把整份读回内存。
