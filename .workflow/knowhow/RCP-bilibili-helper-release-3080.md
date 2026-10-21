---
title: bilibili-helper有断点但没选文件夹时不读后半段发布v3.0.80
category: recipe
createdBy: dsh-agent
sourceRef: "commit:dc9d22c,tag:v3.0.80,repo:Smith-106/bilibili-helper"
---
v3.0.76 只在有文件夹时核对文件长度。没有 q.dir 时，本机断点仍会让 o0 从该字节发 Range，后半段整份进页面。前半段对不上，页面也会被撑大，重试还是这样，而且成功后会清掉断点。v3.0.80 在 resumeFrom>0 且没有 dir 和 spillTo 时，不发请求，抛出 needDir：「已有未下完的部分，请先选择文件夹再接着下」，并清掉 dirAsked。本机断点保留。下次选了同一个文件夹才接着写。续传仿真 T17：记录为 2 字节、没有文件夹，断言请求次数是 0、needDir 为真、记录仍是 2。22 项，verify 102，selfcheck 全绿。残留：两份都小于约 400MB 且页面有空时仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。
