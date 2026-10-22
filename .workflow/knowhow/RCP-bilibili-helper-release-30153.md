---
title: bilibili-helper没点中就清掉这次标记发布v3.0.153
category: recipe
createdBy: dsh-agent
sourceRef: "commit:f6ef06d,tag:v3.0.153,repo:Smith-106/bilibili-helper"
---
v3.0.152 的 pointerdown 会写下一次分开用的标记。按下去又在按钮外松开时，click 不会发生，标记却留着，下一次第一集会分开一次。v3.0.153 用 held 记住这次记号。pointerup 的目标仍是按钮时不清，等 click 把 held 清空再 Dx。pointerup 在按钮外，或 pointercancel，且还没开始下载、q.bh0 仍是这次 held，就用 max-age=0 删掉 cookie，清空 q.bh0，并清掉「已记下」这句。合并仿真 W73 确认 pointerup、pointercancel 在 pointerdown 之后、Dx 之前，点中时先清空 held。批量仿真仍过。93 项，verify 102，selfcheck 全绿。残留：按下的这一句还没执行就被关掉，仍然记不住；有的浏览器挪走时内部仍会复制一次；有的浏览器仍会先把各段攒齐再做成文件；加密标记如果在媒体数据 16KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。
