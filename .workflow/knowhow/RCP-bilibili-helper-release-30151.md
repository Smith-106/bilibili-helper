---
title: bilibili-helper一点按钮就记下并说明发布v3.0.151
category: recipe
createdBy: dsh-agent
sourceRef: "commit:0959b5f,tag:v3.0.151,repo:Smith-106/bilibili-helper"
---
v3.0.150 的标记在 Dx 里。进入 Dx 之前被关掉，还没有标记。v3.0.151 把标记和「已记下，若这次卡住，下次会分开保存」放到批量按钮的 click 里，确认没在下载之后、调用 Dx 之前。已经在下载时再点直接返回，不多记。Dx 看到 q.bh0 就不再另写；没有才自己写。没有合集仍清掉。合并仿真 W65 确认 click 在 Dx(e) 之前，W72 确认说明在 Dx(e) 之前。批量仿真仍过。92 项，verify 102，selfcheck 全绿。残留：按钮处理的这一句还没执行就被关掉，仍然记不住；有的浏览器挪走时内部仍会复制一次；有的浏览器仍会先把各段攒齐再做成文件；加密标记如果在媒体数据 16KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。
