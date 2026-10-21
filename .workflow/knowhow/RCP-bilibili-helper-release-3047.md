---
title: bilibili-helper无基准偏移的分片也能页面内合并发布v3.0.47
category: recipe
createdBy: dsh-agent
sourceRef: "commit:65ee617,tag:v3.0.47,repo:Smith-106/bilibili-helper"
---
v3.0.46 的 qM 只接受 tfhd 带 base-data-offset，或已经置了 default-base-is-moof(0x20000)。ISO 允许两个标志都没有: 隐式基准有的实现当 0(绝对)，有的当 moof 起点。B 站分片常落在这一类，于是 qM 返回空，下载又进 wasm，大文件照样 memory access out of bounds。v3.0.47 在该分支读 trun 的 data_offset(必须有 data-offset-present)。若按绝对位置落在本分片 mdat 内，改成相对 moof；若按相对 moof 才落在 mdat 内，则保持数值。然后给 tfhd 置上 0x20000。两种解释都落得进或都落不进则放弃，qM.why 写原因，t0 打「页面内合并跳过：」。仿真 F3 用无基准的合成分片，合并后 moof+data_offset 指向 VIDE/AUDI。verify 102，selfcheck 全绿。残留: 没有 data_offset 的 trun、超过 1200MB、音视频一边分片一边普通，仍不在页面内合并。
