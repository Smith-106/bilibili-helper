---
title: bilibili-helper音频和视频排队下载避免两份小块同时堆积发布v3.0.59
category: recipe
createdBy: dsh-agent
sourceRef: "commit:6bb8b96,tag:v3.0.59,repo:Smith-106/bilibili-helper"
---
t0 原先 d.map 启动两条 o0，再 Promise.all。音频和视频的分块数组同时长大，整理时还要再分配一份 Uint8Array，大合集在下载阶段就把页面撑死。用户重试仍是两条一起下。v3.0.59 改成 for 循环里 await o0，完成一条 got.push(m) 再下一条，最后 let[N,t]=got。顺序仍是 n===0 音频、n===1 视频。仿真的 o0 在返回前 await Promise.resolve 并记录 maxInflight，W0 断言为 1；若改回并行，两条会在同一次让出时重叠，maxInflight 变成 2。sim-qm 22 项，verify 102，selfcheck 全绿。残留：两条都下完后仍要同时留在内存里才能合并；多轨、加密、超过 1200MB 的仍不是一个 mp4。
