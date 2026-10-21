---
title: bilibili-helper单个视频太大时先选文件夹再下一次发布v3.0.84
category: recipe
createdBy: dsh-agent
sourceRef: "commit:bb821c3,tag:v3.0.84,repo:Smith-106/bilibili-helper"
---
单个视频走 R，不走批量的 bxD。v3.0.83 的 needDir 只停住并清掉 dirAsked，R 没有 catch，按钮再点一次仍没有文件夹，o0 再次抛同一句。v3.0.84 在 R 里包一层只问一次的循环：needDir、还没有 q.dir、且 showDirectoryPicker 是函数时，选到文件夹就重新设置 spillTo 再调用一次 o0。已经问过、不是 needDir、已有文件夹或没有选择函数，就原样抛出。取消选择也抛出，不会反复弹。续传仿真 T21：第一次 needDir，选择函数被调用一次，第二次带着 spillTo 返回 streamed。26 项，verify 102，selfcheck 全绿。残留：两份都小于约 128MB 且页面有空时仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
