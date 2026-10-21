---
title: bilibili-helper分片和数据之间的盒子一起拷走发布v3.0.48
category: recipe
createdBy: dsh-agent
sourceRef: "commit:2e19460,tag:v3.0.48,repo:Smith-106/bilibili-helper"
---
v3.0.47 的 pairs() 要求 moof 的下一个顶层盒子必须是 mdat。B 站分片有时在两者之间放 free 或 sidx。对不上就 qM 返回空，下载又进 wasm，大文件 memory access out of bounds，重试同样失败。v3.0.48 从 moof 往后找到下一个 mdat（中途遇到另一个 moof 则算这对不完整），中间盒子随 moof、mdat 一起拷贝，相对距离不变。base-data-offset 重算为 fileOff + moof长度 + 中间盒子长度 + mdat.header + (oldBase-oldPay)，不再用「mdat 是否超过 4GB」猜头长。找不到 mdat 时 qM.why=分片后面没有数据。仿真 F4：moof 与 mdat 之间夹 16 字节 free，合并后两条 tfhd 的绝对偏移分别指向 VIDE 和 AUDI。sim-qm 10 项，verify 102，selfcheck 全绿。残留：一边分片一边普通、合计超过 1200MB、没有 data_offset 的 trun，仍不在页面内合并。
