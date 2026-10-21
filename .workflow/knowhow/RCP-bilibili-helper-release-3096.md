---
title: bilibili-helper内存错误不再显示英文发布v3.0.96
category: recipe
createdBy: dsh-agent
sourceRef: "commit:b3d5032,tag:v3.0.96,repo:Smith-106/bilibili-helper"
---
合并失败时，catch 在两份还在的情况下会把英文错误嵌进「合并失败（...）」。两份已经不在时直接显示 ✘ 加原文。Array buffer allocation failed 也不在 bxShown 的内存正则里，列表仍是英文，重试看起来像同一次失败。v3.0.96 把 allocation failed、Invalid array length、Invalid typed array length 加进 bxShown 和这处 catch。命中后有两份就 split，说明只写「合并内存不足，不再继续」。没有两份就抛中文「合并内存不足，点重试会分开保存，不再进 ffmpeg」。合并仿真 W26 分配失败的 shown 含不再进 ffmpeg 且不含 allocation。W27 useWasm 下合并器抛 RuntimeError，分开保存且说明不含 RuntimeError。44 项，verify 102，selfcheck 全绿。残留：两份都比较小且合并没有报错时，仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
