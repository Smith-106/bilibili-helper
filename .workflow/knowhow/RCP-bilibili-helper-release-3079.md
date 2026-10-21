---
title: bilibili-helper页面留不住时重试说明改为重新下载发布v3.0.79
category: recipe
createdBy: dsh-agent
sourceRef: "commit:0bc1421,tag:v3.0.79,repo:Smith-106/bilibili-helper"
---
「这一集太大，页面里留不住」含有「页面里留不住」，v3.0.72 会把它说成「点重试会分开保存，不再进 ffmpeg」。这时音视频已经不在页面里，重试只能重新下载；按 ffmpeg 说明重试，用户以为换了路径，实际仍整份再下，长视频再次把页面撑满。v3.0.79 把 bxShown 拆开：请先选择文件夹仍是选文件夹；只有 memory access out of bounds / RuntimeError / Aborted 才写不再进 ffmpeg；其余「页面里留不住」写成「这一集页面里留不住，点重试会重新下载后再分开保存」。合并仿真 W16 同时断言这四种文案。35 项，verify 102，selfcheck 全绿。残留：两份都小于约 400MB 且页面有空时仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
