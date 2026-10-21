---
title: bilibili-helper还不是字节块时按三份留位置发布v3.0.104
category: recipe
createdBy: dsh-agent
sourceRef: "commit:01ae7c0,tag:v3.0.104,repo:Smith-106/bilibili-helper"
---
合并前如果两份还是 Blob，arrayBuffer 会再复制成 Uint8Array，原来的 Blob 还在，qM 还要做出结果。旧判断只留 heldNow*2，复制过程实际是三份。v3.0.104 用 copyExtra 表示两份不都是 Uint8Array，reserve 为 heldNow*3，否则仍是 heldNow*2。有内存报告时看 used+reserve，没有时看 reserve>holdMax。合并仿真 W36：已用 40、上限 100、两份各 6 字节的 Blob。按两份是 64，不到七成会去复制；按三份是 76，分开保存，说明含不再把两份放在一起。52 项，verify 102，selfcheck 全绿。残留：两份已经是字节块且两倍预留仍放得下时，两份和结果仍要同时留在页面里才能合成；多轨、加密的仍是两个文件。
