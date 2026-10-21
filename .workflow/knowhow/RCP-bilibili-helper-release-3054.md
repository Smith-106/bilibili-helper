---
title: bilibili-helper分开保存的原因留在结果行发布v3.0.54
category: recipe
createdBy: dsh-agent
sourceRef: "commit:da6d96c,tag:v3.0.54,repo:Smith-106/bilibili-helper"
---
v3.0.53 默认不进 ffmpeg，合并不了就分开保存。split 把长说明写在进度条 innerHTML 上，批量循环随后用整行 innerHTML 重画，只留下 mergeNote「已分开保存音视频」，原因消失。qM.why 又是函数上的字段，下一集若没再调用 qM，会带上上一集的原因。v3.0.54：qM 进入时 why 默认「结构未识别」，成功 return out 前清空，catch 保留具体原因。t0 每集先把 q.mergeWhy 清空；只有 triedQm 为真才把 qM.why 抄进去。split 在原句 q.mergeNote="已分开保存音视频" 之后，有 mergeWhy 才追加括号。批量重画后的 ✔ 行仍能看到原因。typeof qM 避免回退仿真里没有 qM 绑定。sim-qm 新增 W5：32 字节乱数据，merges 为 0，mergeNote 和状态都含「结构未识别」。共 16 项。verify 102，selfcheck 全绿。残留：认不出或超过 1200MB 的仍是两个文件，不是一个 mp4。
