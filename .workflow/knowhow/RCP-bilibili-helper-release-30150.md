---
title: bilibili-helper找合集之前就说明下次会分开发布v3.0.150
category: recipe
createdBy: dsh-agent
sourceRef: "commit:e992ac0,tag:v3.0.150,repo:Smith-106/bilibili-helper"
---
v3.0.148 在 Bx() 之前写了 bh0，但状态栏没有说明。用户不知道这次卡住后，下次会分开保存。v3.0.150 在写完 cookie、调用 Bx() 之前，把 batch-status 设为「已记下，若这次卡住，下次会分开保存」，并写入 bx0.lastStatus。没有合集时仍清掉 cookie，状态改回未找到合集。合并仿真 W72 确认这句话在 Dx 的标记之后、Bx() 之前。批量仿真仍过。92 项，verify 102，selfcheck 全绿。残留：按下批量下载的这一句还没执行就被关掉，仍然记不住；有的浏览器挪走时内部仍会复制一次；有的浏览器仍会先把各段攒齐再做成文件；加密标记如果在媒体数据 16KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。
