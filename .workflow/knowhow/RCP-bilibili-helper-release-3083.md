---
title: bilibili-helper不报告剩余空间时较大一份先停住或边写发布v3.0.83
category: recipe
createdBy: dsh-agent
sourceRef: "commit:69bf3a9,tag:v3.0.83,repo:Smith-106/bilibili-helper"
---
v3.0.82 只在拼整块和两份叠放时使用 holdMax。o0 仍按 jsMergeMax（1200MB）决定是否整份读进页面，所以大约 128MB 到 1200MB 的一份会先全部进内存，没文件夹时再做成 Blob 留着，重试同样先读进来。v3.0.83 在没有 jsHeapSizeLimit 时，把已知长度的停住点和边下边写点都改成 min(jsMergeMax, holdMax)。没有文件夹抛 needDir：「这一份超过页面能放下的大小，请先选择文件夹再重试」，并清掉 dirAsked。已有 spillTo 则边下边写，返回 streamed。有内存接口时仍用 1200MB。续传仿真 T19 停住，T20 边写 abcd。25 项，verify 102，selfcheck 全绿。残留：两份都小于约 128MB 且页面有空时仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
