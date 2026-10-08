---
title: bilibili-helper下载停滞Range续传修卡住发布v3.0.40(maestro清理发布)
category: recipe
createdBy: dsh-agent
sourceRef: "commit:d42d6e5,tag:v3.0.40,repo:Smith-106/bilibili-helper"
---
根因: 下载到一半进度永冻(如9.90MB停55%)。旧o0纯fetch+ReadableStream逐块读无任何停滞超时, CDN限流/连接僵死时l.read()永不resolve, 进度条永远停原地且无重试, 只能手动取消重下。修: o0重写为停滞检测+Range断点续传——每收到一块重置停滞计时(o0.stallMs默认20s)+dead竞态去重, 超时cancel当前流并抛错→外层catch用Range: bytes=<已收>-续传(已收分片K保留不丢); 无206回退全量重下; 轮间(o0.bk默认1.5s)×轮次退避; 403/404直抛不空转; 416重置偏移; 5轮耗尽才抛; 进度回调try/catch防面板销毁中断; 首轮与旧行为一字不差(无Range全量拉, content-length/content-range双路推导总量)。验实: sim-o0-resume.mjs取真o0源码段+受控桩9项(S0源码三件套+T1干净一致首轮无Range+T2僵死Range续传+T3无206回退+T4 403直抛+T5 5轮耗尽), 修桩两处(T1空headers对象JSON化判空+stallAfter语义)。发布: manifest 3.0.40, verify95(D3仿真门+A68静态钉住6处)/acceptance16/selfcheck全绿, push master+tag v3.0.40+gh release(zip 81049B/16条目同v3.0.38口径不含wasm)。清理: 待kg sync+wiki健康复查。
