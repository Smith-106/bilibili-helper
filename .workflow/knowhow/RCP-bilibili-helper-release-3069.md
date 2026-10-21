---
title: bilibili-helper同一集下第二份前先释放第一份发布v3.0.69
category: recipe
createdBy: dsh-agent
sourceRef: "commit:2d5fd53,tag:v3.0.69,repo:Smith-106/bilibili-helper"
---
v3.0.68 只在下一集开始时 qRel。同一集要分开保存时，第一份 a0 之后的对象 URL 会一直留到下一集，第二份下载期间两份叠在页面里，这一集自己就能撑死，重试一样。v3.0.69 在 bxD 的 running 守护之后 q.rel=qRel。t0 的下载循环在 n>0 时先 q.rel()，再把进度列表里的 blob: 链接改成「已交给浏览器，链接已释放」，然后才下下一份。要在页面里合成一个文件的路径不会提前 a0，q.rel 此时没有链接可释放，不影响合并。合并仿真 W14 把 jsMergeMax 设为 10、两份 size 各 8，断言第二份开始前 relAt===1，最终两个文件且不进合并。31 项，verify 102，selfcheck 全绿。残留：两份都放得下的仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
