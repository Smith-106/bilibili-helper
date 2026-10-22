---
title: bilibili-helper做成文件失败时写明页面放不开发布v3.0.126
category: recipe
createdBy: dsh-agent
sourceRef: "commit:7af77c7,tag:v3.0.126,repo:Smith-106/bilibili-helper"
---
qM 外面有 try。做成文件、改盒子时如果抛出内存类错误，以前一律写成「结构未识别」。用户看不出是页面放不下，重试时也不容易对上原因。v3.0.126 在这个 catch 里识别 memory access out of bounds、out of memory、allocation failed、Invalid array length、Invalid typed array length、RuntimeError、Aborted(。对上就把原因写成「合并时页面放不下」。其它错误仍沿用已经写好的原因，没有才是结构未识别。返回仍是 null，调用方分开保存，默认不进 ffmpeg。合并仿真 W56 把 Blob 换成一构造就抛 Invalid typed array length 的函数，qM 返回 null，原因正好是合并时页面放不下，然后恢复 Blob。73 项，verify 102，selfcheck 全绿。残留：四份预留和两次空间检查都放得下时，两份和结果仍要同时留在页面里才能合成；新记录的赋值还没执行就被关掉，仍然记不住；加密标记如果只在媒体数据里，仍认不出来。不报告剩余空间时，16MB 以下的结果仍会合成。
