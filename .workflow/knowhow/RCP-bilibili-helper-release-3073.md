---
title: bilibili-helper失败后留下已收部分并断点续传发布v3.0.73
category: recipe
createdBy: dsh-agent
sourceRef: "commit:5f219b3,tag:v3.0.73,repo:Smith-106/bilibili-helper"
---
五次续传都失败后，已收到的小块原先随函数结束丢掉。批量重试重新调用 o0，从头再下，长视频会再次把页面撑满。v3.0.73 在有 q.dir、q.spillTo 和 q.partialName 时，把已有小块写入该文件，记下 q.partial={name,bytes}，错误句追加「已保存已收到的部分，点重试会接着下」。下次同一 partialName 从该字节发 Range，createWritable({keepExistingData:true}) 后 seek，新数据只追加，不把已有部分读回页面。续传过程中 resumeFrom>0 就直接写入文件，完成后返回 streamed 并清掉 partial。416 或下完也会清掉 partial。没选文件夹时不记 partial，仍从头再下。续传仿真 T12：第一次五次失败留下 ab，第二次从 2 字节 seek 后写下 cd，文件是 abcd、总长 4。17 项，verify 102，selfcheck 全绿。残留：没选文件夹的失败仍从头再下；两份都放得下且页面有空时仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
