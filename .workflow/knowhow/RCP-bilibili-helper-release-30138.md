---
title: bilibili-helper清理上一集之前就记下发布v3.0.138
category: recipe
createdBy: dsh-agent
sourceRef: "commit:6680531,tag:v3.0.138,repo:Smith-106/bilibili-helper"
---
v3.0.137 的 * 写在读到标题的同一句，但在 qRel 和释放上一集 blob 链接之后。清理很多链接时被关掉，这一集没有标记。v3.0.138 把 let bh 和 bhx=* 挪到取消判断之后、qRel 之前。同一个 bh 仍传给 t0。别人留下的 * 仍只让下一集分开一次然后删掉。合并仿真 W65 确认这个写入位置在循环开始之后、qRel 之前。84 项，批量仿真仍过，verify 102，selfcheck 全绿。残留：取消判断之后的这一句还没执行就被关掉，仍然记不住；做成整份的那一下，两份和结果仍要同时留在页面里；加密标记如果在媒体数据 4KB 之后，仍认不出来。不报告剩余空间时，8MB 以下的结果仍会合成。
