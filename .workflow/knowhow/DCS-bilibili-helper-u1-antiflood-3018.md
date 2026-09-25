---
title: "U1防风控重设计v3.0.18: pn1双败fast-fail+15min冷却记忆+缓存failover+类人pacing"
category: decision
createdBy: pi-agent
sourceRef: "commit:4078f9c,tag:v3.0.18,repo:Smith-106/bilibili-helper"
---
背景: 用户首屏即-799(一点UP批量就请求受限)。实测T1-T8: 大小UP均-799(出口级限流); space HTML SPA空壳; dynamic需鉴权; series/search-type -400; top/arc仅1条→无第二完整列表桶,不换接口。重设计(U1): pn1双败fast-fail(只重试1次约12s)+15min冷却记忆bilibili_helper_uplist_cool_<mid>(期间零请求直接提示)+缓存failover(老缓存partial继续,无缓存进冷却)+页间隔3.5-5s+超稳18s档+成功写缓存清冷却; 中途-799保留递增退避≤4次; S2禁单条回填/S1零抛错/S6节奏保留。harness: A13/A14(+b/c)/B4/C3/C4更新+C5冷却记忆场景,32项全绿; acceptance16全绿。发布v3.0.18+zip资产。