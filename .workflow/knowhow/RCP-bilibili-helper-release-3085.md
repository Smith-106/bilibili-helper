---
title: bilibili-helper合集里这一份太大时先选文件夹再下一次发布v3.0.85
category: recipe
createdBy: dsh-agent
sourceRef: "commit:91a53d8,tag:v3.0.85,repo:Smith-106/bilibili-helper"
---
v3.0.84 只给单个视频的 R 加了只问一次的文件夹选择。合集走 t0，某一份 needDir 时整集失败，用户要点重试才会再碰到批量开头的选择。没点重试就看起来还是同样失败。v3.0.85 在 t0 每一份的 o0 外包同样的循环：还没有 q.dir 时选一次，选到就重新设置 spillTo 再下这一份。已经问过、不是 needDir、已有文件夹或没有选择函数，就原样抛出。合并仿真 W19：第一次抛 needDir，选择函数一次，行文案含已边下边写入文件夹，不进 wasm。36 项，verify 102，selfcheck 全绿。残留：两份都小于约 128MB 且页面有空时仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
