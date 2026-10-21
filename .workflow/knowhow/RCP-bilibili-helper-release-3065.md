---
title: bilibili-helper小块也包不成文件时按小块写入文件夹发布v3.0.65
category: recipe
createdBy: dsh-agent
sourceRef: "commit:03e7464,tag:v3.0.65,repo:Smith-106/bilibili-helper"
---
v3.0.64 在拼不成 Uint8Array 时 new Blob(K)。Blob 构造也可能失败，异常冒出后重试仍先尝试收成一个文件。v3.0.65 在 Blob 失败或 o0.forceParts 时返回 {noHold:true,size,parts:K}，不收成一个文件。t0 和单集 R 有 q.dir 时按小块 createWritable().write，写完把该块置空，原因句是「这一份太大，已按小块写入文件夹」。没有文件夹则 q.dirAsked=!1 并抛出「这一份页面里留不住一整块，请先选择文件夹再重试」。批量开头只在 !q.dir&&!q.dirAsked 时询问，所以下一次重试会再问，而不是重复同一种失败。续传仿真 T7 断言两块拼回 abcd 且没有 blob。合并仿真 W10 断言第二份开始时文件夹里已经写入 1 块；W11 断言没文件夹时抛出上述句子且 dirAsked 被清掉。12 项和 28 项，verify 102，selfcheck 全绿。残留：两份都放得进连续内存的仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
