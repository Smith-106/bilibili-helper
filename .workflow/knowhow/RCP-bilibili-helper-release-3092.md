---
title: bilibili-helper这一份放下去会过满时先停住或边写发布v3.0.92
category: recipe
createdBy: dsh-agent
sourceRef: "commit:5148a36,tag:v3.0.92,repo:Smith-106/bilibili-helper"
---
v3.0.89 只在两份之间看下一份的预告大小。单份下载仍会把超过一成、加上已用会过七成的那一份整份读进 K。v3.0.92 在 o0 的已知长度处和每块处，若 N 或 t 大于 jsHeapSizeLimit 的 0.1 且 used+(N|t) 大于 0.7，就把 cap 降到该长度减一。没文件夹抛 needDir，有 spillTo 则边写。小于一成的一份不触发，所以页面已满时 4 字节仍交 Blob。续传仿真 T24 停住，T25 边写 30 字节，T11 仍交 Blob。30 项，verify 102，selfcheck 全绿。残留：两份都小于约一成且加起来不超过七成时，仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
