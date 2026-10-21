---
title: bilibili-helper合并器每集销毁修OOM重试仍失败发布v3.0.41
category: recipe
createdBy: dsh-agent
sourceRef: "commit:7a2d783,tag:v3.0.41,repo:Smith-106/bilibili-helper"
---
根因: v3.0.39 只补了 MEMFS deleteFile。deleteFile 不缩小 wasm 线性内存(上限2048MB只涨不缩)。T0 把 ffmpeg 实例缓存整段会话, 堆顶满或 worker 已死后, 后续每一集和「重试失败集」都打在同一具尸体上, 所以失败重试必再报 memory access out of bounds。修: qK 每集 readFile 后 terminate 并 q.ffmpegInstance=null(内联 e0.terminate 会 worker.terminate 且 loaded=false); q.ffmpegCore 缓存四个 blob URL 避免每集重拉 31MB wasm; load 失败 terminate 且不写入缓存。OOM/out of memory 时 q._oomR 守卫自动换新实例重试恰好1次, 进度行「内存不足，正在重建合并器并重试…」+ v() 日志; 仍失败则 t0 把 message 改成「合并内存不足（已自动重建合并器重试仍失败，请降低清晰度或改用兼容模式）」并 Object.assign 回抛, 批量记失败而非✔。下载续传轮次补 v() 日志。单集本身超过 wasm 上限仍会失败, 这是 wasm 硬顶不是泄漏。验实: sim-ffmpeg-recycle.mjs 取真 qK/T0/_0, 10项(两集各销毁/OOM换新成功/两次封顶/load失败不缓存)。发布: manifest 3.0.41, verify97(D4+A69)/acceptance16/selfcheck全绿, push+tag v3.0.41+gh release(zip 81975B/16条目)。
