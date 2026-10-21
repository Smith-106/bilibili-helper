---
title: bilibili-helper文件夹权限失效说明改成重新选择发布v3.0.87
category: recipe
createdBy: dsh-agent
sourceRef: "commit:6f5d8a3,tag:v3.0.87,repo:Smith-106/bilibili-helper"
---
v3.0.86 已经在权限失效时清掉文件夹，但批量失败说明仍是 DOMException 的英文 message。用户看不出重试会重新选择，会以为还是同一句失败。v3.0.87 的 bxShown 读取错误名，NotAllowedError 或 SecurityError 写成「文件夹权限失效，点重试会重新选择」。选文件夹、页面里留不住、RuntimeError 三类说明不变。合并仿真 W16 增加这条断言。36 项，verify 102，selfcheck 全绿。残留：两份都小于约 128MB 且页面有空时仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
