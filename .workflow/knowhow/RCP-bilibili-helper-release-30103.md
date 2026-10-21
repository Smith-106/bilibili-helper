---
title: bilibili-helper不报告剩余空间时也提前留结果位置发布v3.0.103
category: recipe
createdBy: dsh-agent
sourceRef: "commit:b4f99a5,tag:v3.0.103,repo:Smith-106/bilibili-helper"
---
没有 jsHeapSizeLimit 时，下第二份前原来只判断 heldBytes>holdMax。已有的一份还没超过，但加上将要下的一份和同样大的合并结果就会超过时，两份仍会先一起进页面。v3.0.103 改为 (heldBytes+nextBytes)*2>holdMax。已有的一份本身已经超过时，说明仍是「这一份已经较大」。否则写成「再留一份合并结果会放不下，先保存这一份再下另一份」。合并仿真 W35：两份实际各 2 字节、报告体积也是 2、holdMax 为 5，第二份开始时已经保存了 1 份，说明含再留一份合并结果会放不下。W18 把 holdMax 调到 5、下一部分报告体积改为 0，使提前判断不触发，合并前的两倍判断仍分开。W32 把报告体积改成 1，holdMax 20，同样仍走合并前分开。51 项，verify 102，selfcheck 全绿。残留：预留之后仍放得下时，两份和结果仍要同时留在页面里才能合成；多轨、加密的仍是两个文件。
