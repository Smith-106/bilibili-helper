---
title: bilibili-helper重试换序号仍分开保存发布v3.0.97
category: recipe
createdBy: dsh-agent
sourceRef: "commit:a081353,tag:v3.0.97,repo:Smith-106/bilibili-helper"
---
批量文件名是三位序号加集名，例如 005_课。只重试失败项时序号会从 005 变成 001，sessionStorage 对不上，t0 又把两份叠去合并。v3.0.97 用 replace(/^\d{3}_/,"") 得到裸名字。读取时除了原键，还认裸名字，以及任意旧键去掉序号后相同的记录。写入时同时记下裸名字。合成成功则删除原键、裸名字和所有同裸名字的序号键。合并仿真 W28：只存了 005_课，用 001_课 下载，分开保存且说明含上次在页面里放不下，不进 wasm。45 项，verify 102，selfcheck 全绿。残留：两份都比较小且合并没有报错时，仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
