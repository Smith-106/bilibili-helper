---
title: bilibili-helper关掉标签页后仍分开保存发布v3.0.99
category: recipe
createdBy: dsh-agent
sourceRef: "commit:670bb4f,tag:v3.0.99,repo:Smith-106/bilibili-helper"
---
v3.0.94 起用 sessionStorage 记 bilibili_helper_nomerge。标签页被内存错误关掉后，这个记录会丢，新开的页面又把两份叠去合并。v3.0.99 在每次写入 sessionStorage 之后，用单独的 try 把同一份 JSON 写入 localStorage。读取时两个存储 Object.assign 合并，所以只剩 localStorage 也能命中。合成成功的删除同样写回 localStorage。合并仿真 W31：没有 sessionStorage，localStorage 里有 020_课，下载分开保存且说明含上次在页面里放不下，不进 wasm。47 项，verify 102，selfcheck 全绿。残留：两份都比较小且合并成功时仍要同时留着才能合成一个 mp4；多轨、加密的仍是两个文件。第一份单独过大时，记下之后的重试会分开保存，但这一次仍可能撑住页面。
