---
title: bilibili-helper报告剩余空间时也给结果留位置发布v3.0.101
category: recipe
createdBy: dsh-agent
sourceRef: "commit:f0439e4,tag:v3.0.101,repo:Smith-106/bilibili-helper"
---
v3.0.100 只在没有 jsHeapSizeLimit 时把 heldNow 乘二。有内存报告时仍是 used+heldNow>limit*0.7，合成结果那一份没算进去。v3.0.101 改为 used+heldNow*2>limit*0.7。合并仿真 W33：已用 50、上限 100、两份各 8 字节。旧判断 66 不到七成会去合并，新判断 82 超过七成，分开保存，说明含不再把两份放在一起。W21 原本就超过七成的情况仍分开。49 项，verify 102，selfcheck 全绿。残留：已用加上两倍仍低于七成时，两份和结果仍要同时留在页面里才能合成；多轨、加密的仍是两个文件。下第二份之前的判断仍只加上即将下载的那一份，还没把合并结果算进去。
