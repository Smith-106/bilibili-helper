---
title: bilibili-helper任何合并错误都分开保存发布v3.0.45
category: recipe
createdBy: dsh-agent
sourceRef: "commit:4b9ad09,tag:v3.0.45,repo:Smith-106/bilibili-helper"
---
失败重试仍失败的一个具体口子: t0 只在报错匹配 memory access out of bounds|out of memory|合并内存不足 时才分开保存。ffmpeg worker 用 toString() 回传, 常见是 RuntimeError: ... 或 Aborted(...), 对不上就 throw, 批量记失败。重试再走同一条合并, 还是失败, 已下载的 blob 被丢掉。v3.0.45: 音视频都在手(N&&t)时任何合并错误都 split, 行内「合并失败（原因前80字）改为分开保存音视频…」。下载失败(Promise.all 抛, 还没有 N/t)仍抛, 不假装成功。_0 的一次自动换实例重试额外认 RuntimeError 与 Aborted(。仿真 sim-merge-fallback 9 项(T2 其它错误也保存, T5 403 仍抛)。verify 100, selfcheck 全绿。残留: 大文件仍不是单个 mp4, wasm 无 WORKERFS, 上限 2GB。
