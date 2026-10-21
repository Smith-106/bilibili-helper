---
title: bilibili-helper下一份放下去会过满时先保存发布v3.0.89
category: recipe
createdBy: dsh-agent
sourceRef: "commit:a1c6c07,tag:v3.0.89,repo:Smith-106/bilibili-helper"
---
下另一份前原来只看 usedJSHeapSize 是否已经超过 jsHeapSizeLimit 的 0.7。页面还在六成、下一份本身很大时，仍会把两份叠在页面里，重试同样叠。v3.0.89 在这一处把下一份的 size 加进去再比。n===0 不加，避免第一份把自己的预告大小算两次。合并仿真 W20：已用 60、上限 100、下一份 20，先保存再下，不合并、不进 wasm。已用 80 的旧用例 W15 仍先保存。37 项，verify 102，selfcheck 全绿。残留：两份都小于约 128MB 且加起来也不超过七成时，仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
