---
title: bilibili-helper数据库不可用时改记更多条发布v3.0.111
category: recipe
createdBy: dsh-agent
sourceRef: "commit:033d239,tag:v3.0.111,repo:Smith-106/bilibili-helper"
---
v3.0.110 在本地名单写不下时把完整名单写入 indexedDB，页面记录只留八条。数据库被禁用时，八条一满仍丢掉最旧的集，重试会再把两份叠在一起。v3.0.111 的 qDbWrite 成功返回 true，失败返回 false。成功时 qPack 仍只留 8 条；失败时改留 30 条，读取也改为 i<30。合并仿真 W43：数据库 open 直接 onerror，177 个 80 字名字仍能在页面记录里找到最早和最晚的；清掉会话名单后再下最早的那一集，不合并，说明含上次在页面里放不下。W42 数据库可用时仍走八条加数据库。59 项，verify 102，selfcheck 全绿。残留：两份已经是字节块且两倍预留仍放得下时，两份和结果仍要同时留在页面里才能合成；三十条也满时，最旧的集仍会被丢掉；多轨、加密的仍是两个文件。
