---
title: bilibili-helper选文件夹失败不再说成ffmpeg发布v3.0.72
category: recipe
createdBy: dsh-agent
sourceRef: "commit:370b43e,tag:v3.0.72,repo:Smith-106/bilibili-helper"
---
「这一份页面里留不住一整块，请先选择文件夹再重试」含有「页面里留不住」，会被失败分类当成内存不足，界面改写成「点重试会分开保存，不再进 ffmpeg」。用户按这个说明重试，真正要做的却是选择文件夹，取消选择后下一次还是同样的失败。v3.0.72 在 bxD 里增加 bxShown：消息里有「请先选择文件夹」时显示「这一份页面里留不住，点重试会先请你选择文件夹」；只有 memory access out of bounds 一类才显示「不再进 ffmpeg」。普通错误原样显示。批量行改为 let sh=bxShown(N)。合并仿真 W16 断言这三种文案。33 项，verify 102，selfcheck 全绿。残留：浏览器不提供 performance.memory 时无法提前感知页面已满；两份都放得下且页面有空时仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
