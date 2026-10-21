---
title: bilibili-helper下另一份之前把合并结果算进去发布v3.0.102
category: recipe
createdBy: dsh-agent
sourceRef: "commit:94785bd,tag:v3.0.102,repo:Smith-106/bilibili-helper"
---
下第二份前原来只判断 used+nextBytes>limit*0.7。合并结果大约是已有一份加即将下载的一份，没算进去时两份会先一起进页面。v3.0.102 改为 used+heldBytes+nextBytes*2>limit*0.7。放不下就把已有的一份先保存，再下另一份。合并仿真 W34：已用 55、上限 100、已有 8 字节、下一部分报告 4 字节。旧判断 59 不到七成会继续下，新判断 71 超过七成，第二份开始时已经保存了 1 份。W21、W33 把报告体积改小，让下第二份的判断不先触发，合并前的两倍判断仍然分开保存。50 项，verify 102，selfcheck 全绿。残留：已用加上这个预留仍低于七成时，两份和结果仍要同时留在页面里才能合成；浏览器不报告剩余空间时，下第二份前仍只看已有的一份是否超过 holdMax，不按两倍预留；多轨、加密的仍是两个文件。
