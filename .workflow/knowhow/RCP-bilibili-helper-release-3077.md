---
title: bilibili-helper接着下之前先截掉旧尾巴发布v3.0.77
category: recipe
createdBy: dsh-agent
sourceRef: "commit:ec16cad,tag:v3.0.77,repo:Smith-106/bilibili-helper"
---
v3.0.76 只在文件短于断点时整份重下。文件更长时仍 seek 到断点再追加，断点之后的旧字节留在文件尾，得到坏文件，下完还会清掉断点，重试不再修尾。v3.0.77 在 o0 和两处写入器上，seek 之后若有 truncate 就先截到 resumeFrom 再写。没有 truncate 的旧桩跳过，T13 仍只 seek。续传仿真 T16 文件长 8、断点 2，断言 truncate(2)、seek(2)、只写下 cd、总长 4。21 项，verify 102，selfcheck 全绿。残留：两份都放得下且页面有空时仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
