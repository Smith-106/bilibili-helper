---
title: bilibili-helper一进来就记下不等准备数据库发布v3.0.134
category: recipe
createdBy: dsh-agent
sourceRef: "commit:7e7caff,tag:v3.0.134,repo:Smith-106/bilibili-helper"
---
v3.0.132 的 * 写在禁用按钮、累计体积之后，还在 qDbRead 定义之后。准备数据库的闭包还没建完就被关掉时，没有标记。v3.0.134 把随机 id 和 bhx=* 放到 t0 的第一句，qDbRead 之前。算出名字后仍用同一个 id 改成名字。扫描跳过自己的 id。合并仿真 W64 确认函数一开头就是这句，在打开名单数据库之前。W62 仍确认别人留下的 * 会分开保存。81 项，verify 102，selfcheck 全绿。残留：这第一句赋值还没执行就被关掉，仍然记不住；做成整份的那一下，两份和结果仍要同时留在页面里；加密标记如果只在媒体数据里，仍认不出来。不报告剩余空间时，8MB 以下的结果仍会合成。
