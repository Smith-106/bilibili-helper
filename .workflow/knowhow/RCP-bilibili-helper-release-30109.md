---
title: bilibili-helper一条页面记录写满后记到下一条发布v3.0.109
category: recipe
createdBy: dsh-agent
sourceRef: "commit:46da18b,tag:v3.0.109,repo:Smith-106/bilibili-helper"
---
v3.0.108 把多集记在一条 bhnm 里，编码超过 1800 就丢掉最旧的集，那一集重试会再把两份叠在一起。v3.0.109 的 qRead 读取 bhnm 到 bhnm7，qPack 按 1800 拆成最多八条。八条都满才从最旧的丢掉。合成成功只删掉这一集并重新打包。合并仿真 W41：23 个 80 字的名字，一条记不下。记录里出现 bhnm1，最早和最晚的名字都在；清掉会话名单后再下最早的那一集，不合并，说明含上次在页面里放不下。57 项，verify 102，selfcheck 全绿。残留：两份已经是字节块且两倍预留仍放得下时，两份和结果仍要同时留在页面里才能合成；八条页面记录都满时，最旧的集仍会被丢掉；多轨、加密的仍是两个文件。
