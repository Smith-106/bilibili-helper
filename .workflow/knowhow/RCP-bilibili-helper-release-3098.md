---
title: bilibili-helper下另一份之前就记住这一集发布v3.0.98
category: recipe
createdBy: dsh-agent
sourceRef: "commit:5231895,tag:v3.0.98,repo:Smith-106/bilibili-helper"
---
v3.0.95 在拷贝和 qM 之前才写 bilibili_helper_nomerge。第二份下载本身把页面撑住时，写键的代码还没跑到，重试又两份一起下。v3.0.98 在循环里 n>0 且还没决定 streamOnly 时，调用下一份下载前就写入原键和去掉三位序号的裸名字。合成成功的删除逻辑不变。合并仿真 W29：第二份开始时键里已有 019_课，合成成功后键里没有，并且只保存一个 mp4。46 项，verify 102，selfcheck 全绿。残留：第一份单独下进页面时仍可能撑住；两份都比较小且合并成功时仍要同时留着才能合成；多轨、加密的仍是两个文件。
