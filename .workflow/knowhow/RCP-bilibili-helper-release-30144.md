---
title: bilibili-helper选文件夹之前就记下发布v3.0.144
category: recipe
createdBy: dsh-agent
sourceRef: "commit:100c0e3,tag:v3.0.144,repo:Smith-106/bilibili-helper"
---
v3.0.142 的 bh0 写在清空进度之后、await z() 之前，但 showDirectoryPicker 更早。选文件夹时被关掉，没有标记。v3.0.144 把 bh0 挪到 bx0.running 之后、选择文件夹之前。第一集仍用这个 bh0。选文件夹或取画质时被关掉，下一次批量会看到这个 *，分开保存一次并删掉。合并仿真 W65 确认 bh0 在 q.dir=await showDirectoryPicker 之前，也在 await z() 之前。批量仿真仍过。86 项，verify 102，selfcheck 全绿。残留：运行批量的这一句还没执行就被关掉，仍然记不住；复制的那一下，原件和副本仍同时在；做成文件的那一下，副本和结果仍同时在；加密标记如果在媒体数据 4KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。
