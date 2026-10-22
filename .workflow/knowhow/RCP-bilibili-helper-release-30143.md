---
title: bilibili-helper先放开原件再做成文件发布v3.0.143
category: recipe
createdBy: dsh-agent
sourceRef: "commit:be7facc,tag:v3.0.143,repo:Smith-106/bilibili-helper"
---
报告了剩余空间并且放得下时，qM 以前直接 new Blob，调用方还握着 videoU 和 audioU。原件和结果同时在页面里。v3.0.143 在不是写入文件夹或临时目录时设 qM.deferBlob。qM 通过 room 之后返回带 hold 的小块，不立刻做文件。调用方先 slice 复制，把 videoU 和 audioU 置空，等一次，再 new Blob。临时目录写入失败时也同样先复制再放开再做文件。直接调用 qM 且没设 deferBlob 时，仍返回 Blob，仿真 B1 和 W68 确认这一点。86 项，verify 102，selfcheck 全绿。残留：批量记下的那一句还没执行就被关掉，仍然记不住；复制的那一下，原件和副本仍同时在；做成文件的那一下，副本和结果仍同时在；加密标记如果在媒体数据 4KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。
