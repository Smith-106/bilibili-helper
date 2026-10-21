---
title: bilibili-helper默认下载不再进ffmpeg发布v3.0.53
category: recipe
createdBy: dsh-agent
sourceRef: "commit:099ed79,tag:v3.0.53,repo:Smith-106/bilibili-helper"
---
memory access out of bounds 只来自 ffmpeg.wasm 的 _0。前面几版把大文件、失败重试挡在 _0 外面，但不到 400MB 且 qM 认不出结构时，第一次下载仍会进 wasm。这一次若把页面撑死，失败列表来不及记下 noWasm，用户重新开始批量等于再走同一条路。v3.0.53 在 t0 调用 _0 之前加 if(!q.useWasm)：音视频还在就分开保存「这一集不进 ffmpeg，改为分开保存音视频」并 return；没有数据就抛「没有可保存的音视频」。默认 useWasm 不是 true，下载路径不再进入 wasm，因此不会再抛 RuntimeError: memory access out of bounds，也不会因为这个错误进入失败重试。qM 成功的返回仍在这道闸之前，认得出的普通 mp4 和分片 mp4 还是一个文件。sim-merge-fallback 的 T1 断言 merges===0；T2/T3 显式 useWasm=true，保留「wasm 抛错就分开保存」和「wasm 成功只存一个 mp4」。verify 102，selfcheck 全绿。残留：qM 认不出或合计超过 1200MB 时不是一个 mp4，而是视频、音频两个文件；只有手动 q.useWasm=true 才会再碰到 wasm 内存错误。
