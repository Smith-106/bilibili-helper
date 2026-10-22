---
title: bilibili-helper没选文件夹也先写入临时目录发布v3.0.128
category: recipe
createdBy: dsh-agent
sourceRef: "commit:9f2765b,tag:v3.0.128,repo:Smith-106/bilibili-helper"
---
v3.0.127 只有选了文件夹才逐块写。没选时 qM 仍 new Blob，整份结果留在页面里。v3.0.128 在 navigator.storage.getDirectory 可用时同样让 qM.wantParts 为真。各块写入临时目录，getFile 后再交给原来的下载。两分钟后 removeEntry。临时目录失败才退回 new Blob。选了文件夹的路径不变。合并仿真 W58 用假的临时目录记录 write，确认写出不止一块、下载名是这一集、期间没有 new Blob、也没有进 ffmpeg。75 项，verify 102，selfcheck 全绿。残留：浏览器没有临时目录时，两份和结果仍要同时留在页面里才能合成；新记录的赋值还没执行就被关掉，仍然记不住；加密标记如果只在媒体数据里，仍认不出来。不报告剩余空间时，16MB 以下的结果仍会合成。
