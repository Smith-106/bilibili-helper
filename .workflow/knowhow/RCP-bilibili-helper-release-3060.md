---
title: bilibili-helper先下完的那份不再显示等待合并发布v3.0.60
category: recipe
createdBy: dsh-agent
sourceRef: "commit:03c2169,tag:v3.0.60,repo:Smith-106/bilibili-helper"
---
v3.0.59 起音频和视频排队下载。音频完成后文案仍是「已下载完成，等待合并」，而视频可能还要下很久。用户以为合并卡住，取消再重试，已经下好的音频也丢了。v3.0.60 用 n<d.length-1 区分：不是最后一份就写「已下载完成，正在下另一份」，最后一份写「已下载完成，正在合并」。源码里不再出现「等待合并」。仿真 W6 读进度行的 textContent，第一行含正在下另一份且不含等待合并，第二行含正在合并。sim-qm 23 项，verify 102，selfcheck 全绿。残留：两份都下完后仍要同时留在内存里才能合并；多轨、加密、超过 1200MB 的仍不是一个 mp4。
