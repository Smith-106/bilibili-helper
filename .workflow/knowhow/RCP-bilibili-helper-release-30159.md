---
title: bilibili-helper文件夹写失败也不再一次复制成整块发布v3.0.159
category: recipe
createdBy: dsh-agent
sourceRef: "commit:de9b3ba,tag:v3.0.159,repo:Smith-106/bilibili-helper"
---
选了浏览器文件夹或 OPFS 时，wantParts 为真。写入失败的旧分支会把每一段 slice 成一份新副本，先放开原件，再一次 new Blob。这是整份复制，绕过了逐段检查。v3.0.159 给 wantParts 的返回补上 vCut。失败后不再 slice，用和内存路径一样的逐段送出：送出前看 used+n 或 sent+n，到 vCut 就 videoU=null 并让出，完成后再 audioU=null。内存类错误重新抛出，原件还在就分开保存。没有 ReadableStream 时才 new Blob。98 项，verify 102，selfcheck 全绿。残留：按下的这一句还没执行就被关掉，仍然记不住；有的浏览器挪走时内部仍会复制一次；有的浏览器仍会先把各段攒齐再做成文件；加密标记如果在媒体数据 32KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。这一段本身没超过门槛时，送出后浏览器仍可能把它和结果同时留着。
