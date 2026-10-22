---
title: bilibili-helper做成文件途中页面满了就停下发布v3.0.155
category: recipe
createdBy: dsh-agent
sourceRef: "commit:2d45979,tag:v3.0.155,repo:Smith-106/bilibili-helper"
---
v3.0.154 每 8 段让出，但页面已经超过七成仍会继续 enqueue，可能把标签页写死。v3.0.155 在第 8、16 段之前让出后看 performance.memory。usedJSHeapSize 大于 jsHeapSizeLimit 的 0.7 就抛 out of memory。内层 catch 设「合并时页面放不下」，放开 owned，再把这个错误抛出去。外层用 byteLength 或 size 判断原件是否还在：还在就分开保存；已经挪走、长度为 0 就抛「合并时页面放不下，点重试会分开保存」，避免把空文件存下来。没有 performance.memory 时不在中途停。合并仿真 95 项，verify 102，selfcheck 全绿。残留：按下的这一句还没执行就被关掉，仍然记不住；有的浏览器不报告内存，中途看不出来；有的浏览器挪走时内部仍会复制一次；有的浏览器仍会先把各段攒齐再做成文件；加密标记如果在媒体数据 16KB 之后，仍认不出来。自己设了上限时，上限的三十二分之一以下仍会合成。
