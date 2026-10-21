---
title: bilibili-helper大文件不进wasm并分开保存发布v3.0.43
category: recipe
createdBy: dsh-agent
sourceRef: "commit:4b897fb,tag:v3.0.43,repo:Smith-106/bilibili-helper"
---
根因分两层。v3.0.41 只解决坏实例复用: deleteFile 不缩 wasm 堆(上限2048MB), T0 缓存尸体, 重试必再报 memory access out of bounds。单集本身太大时新实例照样爆, 峰值约等于音频+视频写进 MEMFS 再加一份成品; 这份 ffmpeg-core 没有 WORKERFS, 无法按需读 blob。v3.0.42 在重建一次仍失败时把已下载的 blob 分开存成 *_视频.mp4 与 *_音频.m4a, 本集不算失败。但 OOM 发生在页面被撑死之前, 兜底来不及。v3.0.43: 音视频合计超过 700MB(q.mergeMax)直接分开保存, 不调用 _0。批量行 innerHTML 会清掉进度区里的下载链接, 所以 split 把 a[download] 记进 q.mergeSaves, 行模板重挂「保存 …」。两次点击间隔 q.splitGap 默认 800ms。700MB 以内仍走合并, OOM 再分开保存。验实: sim-merge-fallback.mjs 8 项, verify 99, selfcheck 全绿。发布 zip 见 release v3.0.43。残留: 超过上限的集拿不到单个合并文件, 只能本地播放器或 ffmpeg 合并; wasm 硬顶未变。
