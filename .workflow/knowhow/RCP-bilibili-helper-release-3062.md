---
title: bilibili-helper接口没报体积时按实际大小先保存发布v3.0.62
category: recipe
createdBy: dsh-agent
sourceRef: "commit:e483ce2,tag:v3.0.62,repo:Smith-106/bilibili-helper"
---
v3.0.61 只在下载前把接口 size 加总。接口报 0 或偏小时 streamOnly 不触发，两份实际都很大仍同时留在 got 里，页面被撑死，重试还是一起堆。v3.0.62 在每一份下完后看 byteLength||size。后面各份都有 size 且加总超过 jsMergeMax，或后面有一份没报体积且这一份已超过上限的一半，就把 got 里已有的先 a0 存掉，再把当前这份存掉，后续改走 streamOnly。原因句是「这一份已经很大且下一份体积未知，不能再同时放下另一份」。后面体积已知且加总不超过上限的仍合并。仿真 mode=fat 返回 600 字节，jsMergeMax=1000，两份 size 都是 0，断言第二份开始时已经保存了 1 个文件。sim-qm 25 项，verify 102，selfcheck 全绿。残留：两份都不大、或能确定加起来不超过 1200MB 的，仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
