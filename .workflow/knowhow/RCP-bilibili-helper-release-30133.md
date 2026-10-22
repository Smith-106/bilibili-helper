---
title: bilibili-helper不报告剩余空间时8MB以上分开发布v3.0.133
category: recipe
createdBy: dsh-agent
sourceRef: "commit:7484bc1,tag:v3.0.133,repo:Smith-106/bilibili-helper"
---
没有 jsHeapSizeLimit 时，v3.0.125 用 (mergeHold 或 holdMax 或 128MB)/8，默认 16MB 以下仍整份合成。v3.0.133 改成 /16，默认 8MB。媒体数据超过这条线就返回「合成结果放不下」，不再 new Blob。有剩余空间报告时仍用原来的 70% 判断，这条只补浏览器不报告的情况。合并仿真 W63 用两份各 2000 字节的媒体，mergeHold 设为 48000。按 /16 这条线是 3000，结果放不下；若仍是 /8，这条线是 6000，这两份会合成。W63 确认分开。80 项，verify 102，selfcheck 全绿。残留：* 这次赋值还没执行就被关掉，仍然记不住；做成整份的那一下，两份和结果仍要同时留在页面里；加密标记如果只在媒体数据里，仍认不出来。不报告剩余空间时，8MB 以下的结果仍会合成。
