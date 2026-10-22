---
title: bilibili-helper还没找合集就记下发布v3.0.148
category: recipe
createdBy: dsh-agent
sourceRef: "commit:c28b49b,tag:v3.0.148,repo:Smith-106/bilibili-helper"
---
v3.0.144 的 bh0 在 bxD 里、选择文件夹之前。找合集的 Bx() 更早，在 Dx 里。找合集时被关掉，没有标记。v3.0.148 在 Dx 确认没有正在下载之后、Bx() 之前写 bh0，放进 q.bh0。没有合集就删掉这个 cookie 并清空 q.bh0。bxD 沿用 q.bh0，没有才自己写。第一集仍用这个记号。合并仿真 W65 确认 Dx 的标记在 Bx() 之前，bxD 在选择文件夹之前取用。批量仿真仍过。90 项，verify 102，selfcheck 全绿。残留：按下批量下载的这一句还没执行就被关掉，仍然记不住；有的浏览器挪走时内部仍会复制一次；做成文件的那一下，挪走的那份和结果仍同时在；加密标记如果在媒体数据 16KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。
