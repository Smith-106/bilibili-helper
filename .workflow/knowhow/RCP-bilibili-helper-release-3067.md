---
title: bilibili-helper没选文件夹的超限文件先停住发布v3.0.67
category: recipe
createdBy: dsh-agent
sourceRef: "commit:8220c06,tag:v3.0.67,repo:Smith-106/bilibili-helper"
---
v3.0.66 只在已经选了文件夹时边下边写。没选文件夹时超限文件仍整份读进 K，页面被撑死，重试还是整份读。v3.0.67 在知道总长超过 jsMergeMax 且没有 dir/spillTo 时，取消正文、dirAsked=!1，抛出带 needDir 的「这一份超过页面能放下的大小，请先选择文件夹再重试」。下载循环对 needDir 直接抛出，不把它当成可续传失败空转 5 次。总长未知但已收字节超过上限且不能写入文件夹时，同样停住，不再把越过上限的那一块放进 K。批量开头在 !dir&&!dirAsked 时重新询问，所以下一次重试会再问文件夹。续传仿真 T9 断言只请求 1 次、getReader 为 0。T10 断言体积未知时只读到越限的那一块（2 次 read，不是 3 次）。15 项，verify 102，selfcheck 全绿。残留：两份都放得下的仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
