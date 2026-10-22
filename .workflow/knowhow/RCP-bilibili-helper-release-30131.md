---
title: bilibili-helper整份下载前放开两份原件发布v3.0.131
category: recipe
createdBy: dsh-agent
sourceRef: "commit:cc60a52,tag:v3.0.131,repo:Smith-106/bilibili-helper"
---
没有临时目录时，qM 做成 Blob 之后，videoU 和 audioU 还留着，a0 下载会和两份原件叠在一起。v3.0.131 在调用 a0 之前先 videoU=null;audioU=null，并等一个任务回合。文件已经在 Blob 里。若这时下载抛出内存类错误，两份已经放开，不能再当场拆开，就抛出「合并时页面放不下，点重试会分开保存」。两份还在时，仍当场分开保存。内层判断补上了 Invalid typed array length、RuntimeError、Aborted(。合并仿真 W61 让保存 mp4 时抛 Invalid typed array length，确认提示里有点重试会分开保存，没有进 ffmpeg，也没有保存出文件。W22 两份还在时仍当场分开。78 项，verify 102，selfcheck 全绿。残留：做成整份的那一下，两份和结果仍要同时留在页面里；新记录的赋值还没执行就被关掉，仍然记不住；加密标记如果只在媒体数据里，仍认不出来。不报告剩余空间时，16MB 以下的结果仍会合成。
