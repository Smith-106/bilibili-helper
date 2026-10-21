---
title: bilibili-helper刷新后仍不再叠在一起发布v3.0.94
category: recipe
createdBy: dsh-agent
sourceRef: "commit:fbc7eeb,tag:v3.0.94,repo:Smith-106/bilibili-helper"
---
v3.0.93 的 q.noMerge 只在内存里。刷新页面后丢失，再下同一集又把两份叠进去。v3.0.94 在 split 时写入 sessionStorage 键 bilibili_helper_nomerge。t0 开头读到这个名字就恢复 q.noMerge 并 streamOnly，说明仍是「这一集上次在页面里放不下，这次分开保存」。sessionStorage 随标签页消失，新开的标签页会再试合成。不写 localStorage。合并仿真 W24：内存里没有 noMerge，只有 sessionStorage 记录，仍分开保存且不进 wasm。41 项，verify 102，selfcheck 全绿。残留：第一次在记住之前仍可能叠在一起；标签页被系统杀掉且 sessionStorage 没写上时，新开仍会再试。多轨、加密的仍是两个文件。
