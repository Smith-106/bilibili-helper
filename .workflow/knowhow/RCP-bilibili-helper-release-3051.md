---
title: bilibili-helper大文件ffmpeg内存不足不再自动重试发布v3.0.51
category: recipe
createdBy: dsh-agent
sourceRef: "commit:44aaafd,tag:v3.0.51,repo:Smith-106/bilibili-helper"
---
_0 在 memory access out of bounds / out of memory / RuntimeError / Aborted( 时会 qK 再递归调用自己一次。这是为了扔掉被上一集污染的 wasm 实例。单集体积本身超过 wasm 能扛的上限时，新实例会以同样方式失败，而且重试期间峰值更高，页面可能在 throw 回到 t0 的分开保存之前被撑死。用户看到的就是失败重试还是失败。v3.0.51 用 size||byteLength||length 合计，只有不超过 q.wasmRetryMax（默认 80MB）才重试。更大则日志「这一集 ffmpeg 内存不足，不再重试，改为分开保存」后直接 throw，由 t0 在 N/t 仍在时分开保存。没有长度的输入合计为 0，不重试。仿真 R1 两个 10MB 会建 2 个实例并成功；R2 两个 100MB 只建 1 个实例并抛出。D4 的 2 字节 Uint8Array 仍走重试，10 项保持全绿。sim-qm 14 项，verify 102，selfcheck 全绿。残留：不超过 400MB 且页面内合并认不出时仍会进一次 wasm；超过 1200MB 不会合成一个文件。
