---
title: bilibili-helper选了文件夹就直接写入不再先复制成新Blob发布v3.0.63
category: recipe
createdBy: dsh-agent
sourceRef: "commit:8c4b521,tag:v3.0.63,repo:Smith-106/bilibili-helper"
---
a0 原先一进来就 new Blob([e])。选了文件夹时，大文件在写入前又多一份完整副本，页面被撑死，重试还是先复制再写。v3.0.63 把 blob 留空，目录分支 w.write(e) 直接写 Uint8Array 或已有 Blob，成功后把参数置空。只有点击下载才走 asBlob，临时 new Blob。仿真 S1 传入 Uint8Array，断言写入记录是 v.mp4:4:true:raw，不是 blob。S2 目录失败仍退回点击。sim-qm 25 项，verify 102，selfcheck 全绿。残留：没选文件夹时弹出下载仍要包一层；两份都不大的仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
