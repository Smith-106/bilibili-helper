---
title: bilibili-helper不报告剩余空间时写明不再整份合成发布v3.0.140
category: recipe
createdBy: dsh-agent
sourceRef: "commit:13bedea,tag:v3.0.140,repo:Smith-106/bilibili-helper"
---
没有 jsHeapSizeLimit 时，v3.0.139 超过 4MB 就分开，但原因仍写「合成结果放不下」。这和页面真的满了是同一句，容易再点重试。v3.0.140 把这条线的原因改成「浏览器没报告剩余空间，不再整份合成」。有剩余空间报告且超过七成时，仍写「合成结果放不下」。分开保存的说明会带上这句原因。合并仿真 W55 和 W63 确认新原因，W54 确认页面满了时仍是旧原因。84 项，verify 102，selfcheck 全绿。残留：取消判断之后的这一句还没执行就被关掉，仍然记不住；做成整份的那一下，两份和结果仍要同时留在页面里；加密标记如果在媒体数据 4KB 之后，仍认不出来。不报告剩余空间时，4MB 以下的结果仍会合成。
