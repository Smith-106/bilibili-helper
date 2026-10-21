---
title: bilibili-helper不能选文件夹时清掉断点从头下发布v3.0.81
category: recipe
createdBy: dsh-agent
sourceRef: "commit:f855dd0,tag:v3.0.81,repo:Smith-106/bilibili-helper"
---
v3.0.80 在有断点但没有文件夹时一律抛 needDir。浏览器没有 showDirectoryPicker 时，用户无法选文件夹，每次重试都停在同一句，既不能接着下，也不会从头下。v3.0.81 只在 globalThis.showDirectoryPicker 是函数时抛 needDir 并保留断点。否则把 resumeFrom、q.partial 和该文件名的本机记录清掉，从头请求完整文件。续传仿真 T17 装上选择函数，仍是 0 次请求且断点保留。T18 没有选择函数，断言不带 Range、内容是 abcd、记录被删。23 项，verify 102，selfcheck 全绿。残留：两份都小于约 400MB 且页面有空时仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
