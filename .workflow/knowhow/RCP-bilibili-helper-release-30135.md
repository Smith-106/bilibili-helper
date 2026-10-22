---
title: bilibili-helper调用下载之前就记下文v3.0.135
category: recipe
createdBy: dsh-agent
sourceRef: "commit:2dfe140,tag:v3.0.135,repo:Smith-106/bilibili-helper"
---
v3.0.134 的 * 在 t0 第一句。调用已经开始、函数还没进去时被关掉，没有标记。v3.0.135 在单集和批量两处调用前先写 bhx=*，把这个 id 作为 t0 的最后一个参数传入。t0 使用传入的 id，不再另造一个，所以同一次不会把自己刚写的 * 认成上次。记号直接写在调用旁边，批量仿真抽出来的那段代码不依赖外部函数。先用独立的 bhMark 时，批量仿真报 bhMark is not defined，所以改成当场写。合并仿真 W65 确认两处调用都先写再传入。批量仿真 17 项仍过。82 项合并仿真，verify 102，selfcheck 全绿。残留：调用这一句还没执行就被关掉，仍然记不住；做成整份的那一下，两份和结果仍要同时留在页面里；加密标记如果只在媒体数据里，仍认不出来。不报告剩余空间时，8MB 以下的结果仍会合成。
