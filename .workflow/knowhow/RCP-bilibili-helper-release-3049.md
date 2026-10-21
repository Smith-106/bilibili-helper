---
title: bilibili-helper合并只写一份成品并挡住大文件进wasm发布v3.0.49
category: recipe
createdBy: dsh-agent
sourceRef: "commit:b5509e4,tag:v3.0.49,repo:Smith-106/bilibili-helper"
---
页面内合并原先把 mdat 先复制进中间缓冲区，再复制进成品；调用方同时握着 Blob 和 arrayBuffer 副本。大文件峰值大约三到四份，标签页在 catch 之前被撑死，批量重试会再走一遍，表现就是 RuntimeError: memory access out of bounds 还是失败。v3.0.49：普通 mp4 的样本只 set 进唯一的 out；分片的 mdat 用 subarray 视图，只在最后拷进 out。合计超过 q.wasmSkip（默认 400MB）且不超过 jsMergeMax（1200MB）时，先把 N/t 置空再 qM，成功直接保存；失败或抛错则用仍在手的 Uint8Array 分开保存并 return，不调用 _0。低于 400MB 仍可回退 ffmpeg。仿真 W2 把 size 报成 500MB、字节仍是可合并的小样本，merges 保持 0。sim-qm 11 项，verify 102，selfcheck 全绿。残留：超过 1200MB 仍不尝试页面内合并；一边分片一边普通、没有 data_offset 的 trun，大文件会分开保存而不是一个 mp4。
