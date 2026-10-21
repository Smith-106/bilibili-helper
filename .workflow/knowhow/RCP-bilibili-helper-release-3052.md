---
title: bilibili-helper内存不足的失败重试不再进wasm发布v3.0.52
category: recipe
createdBy: dsh-agent
sourceRef: "commit:7a83f34,tag:v3.0.52,repo:Smith-106/bilibili-helper"
---
批量失败会进入 failItems，按钮「重试失败N集」把同一批对象再跑一遍 t0。页面内合并认不出、体积又不到 400MB 时仍会进 _0。第一次 memory access out of bounds 若在分开保存之前把页面撑住，用户点重试会再走同一条 wasm，还是失败。v3.0.52：catch 文本匹配 memory access out of bounds、out of memory、RuntimeError、Aborted( 或「页面里留不住」时，给该集 h.noWasm=true，行文改为「合并内存不足，点重试会分开保存，不再进 ffmpeg」。调用 t0 前 q.noWasm=!!h.noWasm，finally 清掉。t0 在超过 400MB 的闸门之后、_0 之前若 q.noWasm 且音视频还在，就分开保存并 return。其它失败原因不打标记，仍按原路重试。仿真 W4 不提供 arrayBuffer 且 q.noWasm，merges 保持 0，保存视频和音频两个文件。sim-qm 15 项，verify 102，selfcheck 全绿。残留：这种集的第一次下载，不到 400MB 且认不出结构时仍会进一次 wasm；超过 1200MB 不会合成一个文件。
