---
title: bilibili-helper给合并结果留位置发布v3.0.100
category: recipe
createdBy: dsh-agent
sourceRef: "commit:890d56c,tag:v3.0.100,repo:Smith-106/bilibili-helper"
---
没有 jsHeapSizeLimit 时，合并前只判断 heldNow>holdMax。两份各自还能放下，但合成还要再留出一份同样大的结果，这一份没算进去，页面仍可能被撑住并出现 memory access out of bounds。v3.0.100 改为 heldNow*2>holdMax。合并仿真 W32：两份各 8 字节、holdMax 为 20，旧判断 16 不超，新判断 32 超，于是分开保存，说明含两份加起来已经较大，不进 wasm。W18 两份已经超过 holdMax 的情况仍分开。48 项，verify 102，selfcheck 全绿。残留：浏览器能报告剩余空间时仍用已用加已持有超过七成的判断，不按两倍预留；两份加结果都放得下时仍要同时留在页面里才能合成；多轨、加密的仍是两个文件。
