---
title: bilibili-helper分片数据块长度为零时写成真实长度发布v3.0.56
category: recipe
createdBy: dsh-agent
sourceRef: "commit:32f10b3,tag:v3.0.56,repo:Smith-106/bilibili-helper"
---
ISO BMFF 里 box size 为 0 表示该盒一直延伸到文件末尾。解析时 boxes() 已把 size 换成 e-o，所以能找到后面的 moof。但 patchPair 用 sl() 原样拷贝 mdat，拷贝件的前 4 字节仍是 0。视频分片和音频分片拼进同一个文件后，前面的 mdat 在播放器里会吞掉后面的音轨，文件打不开。用户再下一次，qM 仍成功返回坏文件，看起来像合并成功，重试还是坏的。v3.0.56 在拷贝后若 r32(md,0)===0，且长度不超过 4294967295，就 w32 写成 md.length。更长则 qM.why=数据块太长并返回空，改走分开保存。size 为 1 的 64 位长度本身就是本盒长度，不必改。仿真 F5 把 makeFrag 最后一个盒的 size 写成 0，合并结果能按显式长度走到文件尾，且同时含 VIDE 与 AUDI。sim-qm 19 项，verify 102，selfcheck 全绿。残留：多轨、加密、超过 1200MB 的仍不是一个 mp4。
