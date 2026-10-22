---
title: bilibili-helper按下时就记下点下去才开始发布v3.0.152
category: recipe
createdBy: dsh-agent
sourceRef: "commit:583f777,tag:v3.0.152,repo:Smith-106/bilibili-helper"
---
v3.0.151 的标记在 click 里。click 还没开始就被关掉，没有标记。v3.0.152 把写标记的 arm 放到按钮绑定之前。pointerdown 调用 arm，click 再调用 arm 后才 Dx。arm 在已经在下载、已经有 q.bh0、或右键时直接返回，不会多记。状态仍是「已记下，若这次卡住，下次会分开保存」。arm 不能写在逗号表达式里面，否则 let 是语法错误。合并仿真 W65 确认 pointerdown 在 Dx(e) 之前，W72 确认说明在 pointerdown 之前。批量仿真仍过。92 项，verify 102，selfcheck 全绿。残留：按下的这一句还没执行就被关掉，仍然记不住；按下去又松开、没有点中时，下一次第一集会分开一次；有的浏览器挪走时内部仍会复制一次；有的浏览器仍会先把各段攒齐再做成文件；加密标记如果在媒体数据 16KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。
