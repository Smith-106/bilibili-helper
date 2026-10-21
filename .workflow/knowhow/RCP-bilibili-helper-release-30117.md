---
title: bilibili-helper两份字节块再留一份结果也分开保存发布v3.0.117
category: recipe
createdBy: dsh-agent
sourceRef: "commit:6c74bfd,tag:v3.0.117,repo:Smith-106/bilibili-helper"
---
合并前的预留原来是：两份都已是字节块时留 heldNow*2，否则留 heldNow*3。字节块看着再留两份还放得下，就会把两份和合成结果叠在页面里。结果那一份再占的空间可能把页面撑住，出现 memory access out of bounds。v3.0.117 改成一律 reserve=heldNow*3。放不下就分开保存，文案仍是不再把两份放在一起，不进 ffmpeg。合并仿真 W49：已用 40、上限 100，两份各 6 字节。按两份算 40+24 仍不超过七成，按三份算 40+36 超过七成，于是分开保存。小文件、页面不紧时仍合成一个文件，W2 超过 400MB 的页面内合并仍在。65 项，verify 102，selfcheck 全绿。残留：三份预留仍放得下时，两份和结果仍要同时留在页面里才能合成；上一条最短记录还没看完就被关掉，这一次新的记录仍写不上；短标记也放不下时，最旧的仍会被丢掉；多轨、加密的仍是两个文件。
