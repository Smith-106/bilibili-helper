---
title: bilibili-helper合并时放不下就分开保存发布v3.0.91
category: recipe
createdBy: dsh-agent
sourceRef: "commit:8817a46,tag:v3.0.91,repo:Smith-106/bilibili-helper"
---
qM 或拷贝成 Uint8Array 抛错时，原来的 catch 只在 heavy（超过 wasmSkip）时 split 并 return。较小的一份会落到后面的流程。useWasm 为真时会再进 ffmpeg，出现 memory access out of bounds，重试再进。v3.0.91 在 catch 里先认 allocation failed、Invalid array length、out of memory、memory access out of bounds。两份还在就写 mergeWhy「合并时页面放不下，改为分开保存」，split 后 return。合并仿真 W22：arrayBuffer 抛这个错，分开保存，不进 wasm。39 项，verify 102，selfcheck 全绿。残留：两份真实字节加已用空间仍低于七成、且合并没有抛错时，仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
