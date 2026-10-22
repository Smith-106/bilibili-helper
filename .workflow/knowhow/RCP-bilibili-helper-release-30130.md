---
title: bilibili-helper能写入时进度不再说页面会卡住发布v3.0.130
category: recipe
createdBy: dsh-agent
sourceRef: "commit:2375949,tag:v3.0.130,repo:Smith-106/bilibili-helper"
---
最后一份下完时，进度一律写「已下载完成，正在合并，若页面卡住请点重试，重试会分开保存」。选了文件夹或有临时目录时并不会整份放在页面里，这句会让人以为还是会卡住。v3.0.130 在 q.dir.getFileHandle 或 navigator.storage.getDirectory 可用时改成「已下载完成，正在写入，不再整份放在页面里」。两者都没有时仍用原来的卡住提示。合并仿真 W6 在没有临时目录时仍看到重试会分开保存。W60 安了假的临时目录，视频那一行有正在写入、没有若页面卡住。77 项，verify 102，selfcheck 全绿。残留：浏览器没有临时目录、只能做整份时，两份和结果仍要同时留在页面里；新记录的赋值还没执行就被关掉，仍然记不住；加密标记如果只在媒体数据里，仍认不出来。不报告剩余空间时，16MB 以下的结果仍会合成。
