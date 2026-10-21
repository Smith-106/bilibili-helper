---
title: bilibili-helper批量写入所选文件夹避免第二个下载被拦发布v3.0.55
category: recipe
createdBy: dsh-agent
sourceRef: "commit:148d8f8,tag:v3.0.55,repo:Smith-106/bilibili-helper"
---
分开保存会 a0 两次：先视频再隔 splitGap 点音频。两次都是脚本合成的点击，没有新的用户手势。Chrome 经常只放行第一个下载，音频被静默丢掉。用户看到分开保存却少一个文件，点重试又走同一条路。v3.0.55：bxD 一开始若没有 q.dir 且存在 showDirectoryPicker，同一页只问一次（q.dirAsked）。a0 发现 q.dir.getFileHandle 就 createWritable 把 Blob 写进去，不 dispatchEvent，并设 q.dirNote。写入失败则清掉 q.dir，退回原来的点击。成功行在原「✔ mergeNote」后面另加一截「已写入所选文件夹」，原模板字符串保持不变，Qs 为 0 的汇总文案不变。取消选择或浏览器没有这个接口时，行为与以前相同。仿真 S1 写入 4 字节且 clicks 为 0；S2 句柄抛错后退回点击。sim-qm 18 项，verify 102，selfcheck 全绿。残留：认不出或超过 1200MB 的仍是两个文件；没选文件夹时第二个自动下载仍可能被浏览器拦住，行上还有手动链接。
