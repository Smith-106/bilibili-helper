---
title: bilibili-helper取画质之前就记下发布v3.0.142
category: recipe
createdBy: dsh-agent
sourceRef: "commit:f7a1609,tag:v3.0.142,repo:Smith-106/bilibili-helper"
---
v3.0.138 的 * 在每一集循环里、qRel 之前。取画质 await z() 和算剩余时间时被关掉，还没有标记。v3.0.142 在清空进度之后、let F0 和 await z() 之前写 bh0。第一集用 bh0，不再另造一个，所以同一次不会把自己刚写的 * 认成上次。后面的集仍各写一个。取画质时被关掉，下一次批量的第一集会看到这个 *，分开保存一次并删掉。合并仿真 W65 确认 bh0 在 await z() 之前，循环里的记号在 qRel 之前。批量仿真 17 项仍过。85 项，verify 102，selfcheck 全绿。残留：批量这一句还没执行就被关掉，仍然记不住；报告了剩余空间并且放得下时，做成整份的那一下，两份和结果仍要同时留在页面里；加密标记如果在媒体数据 4KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。
