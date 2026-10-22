---
title: bilibili-helper媒体数据开头的加密也分开发布v3.0.136
category: recipe
createdBy: dsh-agent
sourceRef: "commit:f58c62c,tag:v3.0.136,repo:Smith-106/bilibili-helper"
---
加密标记以前只在 moov 里找。sinf、enca、encv、schm 只出现在 mdat 开头时，仍会继续合成。v3.0.136 增加 markHead，只看 mdat 前 4104 字节。从第 8 字节起，先看 4 字节长度是否不小于 8 且没有超出这块数据，再看后面是不是这四个标记之一。认出来就写「视频已加密」或「音频已加密」并返回空，于是分开保存。不扫整段媒体数据，避免正常画面碰巧凑出这四个字节。合并仿真 F8 把 sinf 只放在 mdat 里，文件头没有，结果仍是视频已加密。普通小文件 F 和 W1 仍能合成。83 项，verify 102，selfcheck 全绿。残留：调用记下的那一句还没执行就被关掉，仍然记不住；做成整份的那一下，两份和结果仍要同时留在页面里；加密标记如果在媒体数据 4KB 之后，仍认不出来。不报告剩余空间时，8MB 以下的结果仍会合成。
