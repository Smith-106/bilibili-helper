---
title: bilibili-helper每一集一开始就记下且只影响下一集发布v3.0.137
category: recipe
createdBy: dsh-agent
sourceRef: "commit:4f226ee,tag:v3.0.137,repo:Smith-106/bilibili-helper"
---
批量以前要到调用 t0 才写 *。取分 P 列表或播放地址时被关掉，没有标记。v3.0.137 在读到 F0[a] 时就写 bhx=bh 的值 *，后面把同一个 bh 传进 t0。t0 仍跳过自己的 id。别人留下的 * 会让这一集分开，并立刻把那条 cookie 设为 max-age=0。所以只影响下一集，不会让后面每一集都分开。单集按钮仍在调用前当场写。合并仿真 W66 先放 bhxold=*，049甲分开且标记被清掉，049乙重新合成。84 项，批量仿真仍过，verify 102，selfcheck 全绿。残留：这一集的第一句还没执行就被关掉，仍然记不住；做成整份的那一下，两份和结果仍要同时留在页面里；加密标记如果在媒体数据 4KB 之后，仍认不出来。不报告剩余空间时，8MB 以下的结果仍会合成。
