---
title: bilibili-helper写完就放开两份原件发布v3.0.129
category: recipe
createdBy: dsh-agent
sourceRef: "commit:60b1fa2,tag:v3.0.129,repo:Smith-106/bilibili-helper"
---
逐块写入之后，videoU 和 audioU 仍留在函数里。下载或后续清理会和两份原件叠在一起。v3.0.129 在文件夹 close 之后立刻 videoU=null;audioU=null。临时目录则先 getFile，再放开两份，并等一个任务回合，再交给下载。这样原件的视图可以先被收掉。临时目录失败要退回 new Blob 时不放开，因为还要用各块。合并仿真 W59 确认 getFile 之后立刻放开，并且这发生在 a0 之前。76 项，verify 102，selfcheck 全绿。残留：浏览器没有临时目录、只能做整份时，两份和结果仍要同时留在页面里；新记录的赋值还没执行就被关掉，仍然记不住；加密标记如果只在媒体数据里，仍认不出来。不报告剩余空间时，16MB 以下的结果仍会合成。
