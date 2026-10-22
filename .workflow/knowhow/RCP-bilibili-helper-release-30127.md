---
title: bilibili-helper选了文件夹就逐块写入发布v3.0.127
category: recipe
createdBy: dsh-agent
sourceRef: "commit:c617bec,tag:v3.0.127,repo:Smith-106/bilibili-helper"
---
合成成功时，两份和结果以前都要留在页面里。选了文件夹也一样，因为 qM 先 new Blob，a0 再整份 write。v3.0.127 在有 q.dir.getFileHandle 时把 qM.wantParts 设为真。qM 返回 parts 和 size，不再做 Blob。调用方逐块 write 后关掉。没选文件夹时仍做 Blob 再下载。写入失败会清掉 wantParts，并按原来的失败路径分开保存。合并仿真 W57 用一个只记录 write 的文件夹，确认写出不止一块、第一块是 ftyp、没有再走下载保存、也没有进 ffmpeg。74 项，verify 102，selfcheck 全绿。残留：没选文件夹时，两份和结果仍要同时留在页面里才能合成；新记录的赋值还没执行就被关掉，仍然记不住；加密标记如果只在媒体数据里，仍认不出来。不报告剩余空间时，16MB 以下的结果仍会合成。
