---
title: bilibili-helper页面内合并mp4绕过wasm发布v3.0.46
category: recipe
createdBy: dsh-agent
sourceRef: "commit:927fc2c,tag:v3.0.46,repo:Smith-106/bilibili-helper"
---
memory access out of bounds 的硬顶是 ffmpeg-core wasm 最大 2048MB, 且没有 WORKERFS。音视频整份 writeFile 再加成品, 单集峰值大约两到三份。换新实例、分开保存都避免不了「要一个合并文件」。v3.0.46 的 qM 在页面里合并: 两边都是普通 mp4(一条 trak, stco/co64 指向 mdat)时改写样本绝对偏移; 两边都是分片 mp4 时改 tfhd 的 base-data-offset(缺省且没有 default-base-is-moof 则放弃)并把音频轨号改成不与视频冲突。合计不超过 q.jsMergeMax(默认 1200MB)才尝试, 成功则不调用 _0。结构不一致、乱数据、超过上限仍走 ffmpeg 或分开保存。仿真 evidence/sim-qm.mjs 用合成样本验证偏移落在 VIDE/AUDI 样本上, 并抽出真实 t0 确认成功路径 merges=0。verify 102, selfcheck 全绿。残留: 真实稿件若带多条轨道、加密、或 tfhd 既无绝对偏移也无 default-base-is-moof, 仍会回退; 超过 1200MB 不会在页面里再复制一份。
