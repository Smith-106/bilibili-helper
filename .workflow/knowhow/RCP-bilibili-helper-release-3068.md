---
title: bilibili-helper下一集开始前释放上一集下载链接发布v3.0.68
category: recipe
createdBy: dsh-agent
sourceRef: "commit:80ca12d,tag:v3.0.68,repo:Smith-106/bilibili-helper"
---
每一集点保存后，对象 URL 原先再留 60 秒。下一集或失败重试一开始下载，上一集的整份数据还在，两集叠在一起会把页面撑死，重试得到同样的结果。v3.0.68 在 q0 里把新建的 URL 推进 q.epBlobs。bxD 在 running 守护之后定义 qRel，每一集循环开始时调用：revokeObjectURL、移出 blobUrls、清空 epBlobs，并把列表里残留的 blob: 链接改成「已交给浏览器，链接已释放」。qRel 不能写在 bxD 签名和 if(bx0.running)return 之间，否则 A32 的开头守护匹配失败，重试按钮双击仍可能并发两轮。合并仿真 W13 断言两条链接都被释放且集合被清空。30 项，verify 102，selfcheck 全绿。残留：两份都放得下的仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
