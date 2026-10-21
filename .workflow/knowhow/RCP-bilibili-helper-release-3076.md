---
title: bilibili-helper文件夹对不上断点时从头下发布v3.0.76
category: recipe
createdBy: dsh-agent
sourceRef: "commit:7e98b0c,tag:v3.0.76,repo:Smith-106/bilibili-helper"
---
v3.0.75 只看本机记录的字节数。换了文件夹或半截文件已经不在时，仍从该字节发 Range，再 seek 到空文件中间，得到缺了前半段的坏文件，而且下完会清掉断点，重试也不会再补头。v3.0.76 在恢复断点后调用 getFileHandle。句柄有 getFile 时核对 size，小于断点或打开失败就把 resumeFrom 和 t 置 0，删掉该文件名的记录，整份重下。没有 getFile 的旧桩不改变续传，所以 T13 仍从 bytes=2- 接着下。续传仿真 T15 把文件大小设为 0、记录为 2，断言请求不带 Range、内容是 abcd、记录被删。20 项，verify 102，selfcheck 全绿。残留：两份都放得下且页面有空时仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
