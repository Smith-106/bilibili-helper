---
title: bilibili-helper不报告剩余空间时结果太大也分开发布v3.0.125
category: recipe
createdBy: dsh-agent
sourceRef: "commit:4f09b7d,tag:v3.0.125,repo:Smith-106/bilibili-helper"
---
v3.0.124 的 room 只在有 jsHeapSizeLimit 时拦截。Firefox 等不报告剩余空间的浏览器会直接做成文件。v3.0.125 在没有上限时，结果大小超过 (q.mergeHold 或 q.holdMax 或 128MB) 的八分之一就返回，原因仍是「合成结果放不下」。默认 128MB 的八分之一是 16MB。有上限时仍是已用加结果超过七成才拦，不改原来的判断。合并仿真 W55 把 performance 设成空对象，mergeHold 设成 8，直接调用 qM。结果是 null，原因是合成结果放不下。72 项，verify 102，selfcheck 全绿。残留：四份预留和这两次检查都放得下时，两份和结果仍要同时留在页面里才能合成；新记录的赋值还没执行就被关掉，仍然记不住；加密标记如果只在媒体数据里，仍认不出来。不报告剩余空间时，16MB 以下的结果仍会合成。
