---
title: bilibili-helper页面内合并改为分段Blob避免再复制整集发布v3.0.57
category: recipe
createdBy: dsh-agent
sourceRef: "commit:77ffd09,tag:v3.0.57,repo:Smith-106/bilibili-helper"
---
qM 以前在返回前 new Uint8Array(整段) 再 set 一遍。调用方已经持有音视频两份 Uint8Array，再加这一份就是大约 3 倍。大合集页面被撑死，用户重试仍走同一步。v3.0.57 普通文件只新建文件头，mdat 负载用 subarray 视图放进 Blob；分片把已有 pieces 直接 new Blob(pieces)，不再拼成一整块。成功判断从 jm.length 改为 jm.size||jm.length，因为 Blob 没有 length。两份 arrayBuffer 都成功后立刻 t=null,N=null，让下载缓存可以回收。size 为 0 的 mdat 必须先 md=new Uint8Array(md) 再改长度，否则 w32 会改到源缓冲，失败后分开保存的是被改过的数据。仿真把 Blob 再读回字节，B/F 检查与以前一致；M1/M2 断言普通和分片的返回值都是 Blob。21 项，verify 102，selfcheck 全绿。残留：读入阶段仍要各一份完整缓冲；多轨、加密、超过 1200MB 的仍不是一个 mp4。
