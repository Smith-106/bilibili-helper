---
title: bilibili-helper不报告剩余空间时4MB以上分开发布v3.0.139
category: recipe
createdBy: dsh-agent
sourceRef: "commit:fdea116,tag:v3.0.139,repo:Smith-106/bilibili-helper"
---
没有 jsHeapSizeLimit 时，v3.0.133 用 128MB/16，默认 8MB 以下仍整份合成。两份原件还在时，8MB 的结果仍可能把页面撑住。v3.0.139 改成 /32，默认 4MB。有剩余空间报告时仍用 70% 判断。合并仿真 W63 用两份各 2000 字节、mergeHold 96000。按 /32 这条线是 3000，会分开；若仍是 /16，这条线是 6000，这两份会合成。W63 确认分开。84 项，verify 102，selfcheck 全绿。残留：取消判断之后的这一句还没执行就被关掉，仍然记不住；做成整份的那一下，两份和结果仍要同时留在页面里；加密标记如果在媒体数据 4KB 之后，仍认不出来。不报告剩余空间时，4MB 以下的结果仍会合成。
