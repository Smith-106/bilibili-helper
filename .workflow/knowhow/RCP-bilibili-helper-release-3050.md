---
title: bilibili-helper超过400MB中途出错也不再进wasm发布v3.0.50
category: recipe
createdBy: dsh-agent
sourceRef: "commit:da1ad2b,tag:v3.0.50,repo:Smith-106/bilibili-helper"
---
v3.0.49 只在「两个 Uint8Array 都已经拿到」时，超过 q.wasmSkip（400MB）才避开 _0。arrayBuffer 在第一个文件就抛错时 videoU/audioU 为空，catch 不成立，400MB 到 700MB 会落到 ffmpeg。wasm 峰值约两到三份，页面在 catch 前被撑死，批量重试同一条路，还是 RuntimeError: memory access out of bounds。v3.0.50：heavy 的 catch 只要 N/t 还在就分开保存；真正调用 _0 之前再查一次 sum>wasmSkip，有数据就分开保存，没有就抛「这一集太大，页面里留不住」，两种都不进 _0。超过 700MB 的原提示仍优先。仿真 W3 把两路 size 设为 250MB 且 arrayBuffer 抛错，merges 保持 0，保存视频.mp4 与音频.m4a。sim-qm 12 项，verify 102，selfcheck 全绿。残留：不到 400MB 且页面内合并认不出结构时仍会进 wasm；超过 1200MB 不会尝试合成一个文件。
