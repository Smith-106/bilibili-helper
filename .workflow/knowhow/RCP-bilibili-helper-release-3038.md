---
title: bilibili-helper合集逐分P展开+UP下载腿同修+批量行UI发布v3.0.37-3.0.38(maestro清理发布)
category: recipe
createdBy: dsh-agent
sourceRef: "commit:c7a6821,tag:v3.0.38,repo:Smith-106/bilibili-helper,session:maestro-bilibili-release-3038"
---
根因: 合集分集本身是多P课程(sections[].episodes[].pages[] 90/120/56/58=324), 旧Bx每集压一条cid=ep.cid(=该视频P1)→只下4个。修: bxSp三级取全部分P(当前视频pages>分集pages>availableVideoList.list, 列表腿零请求)+bxPgs逐P条目+bxPn命名+bxSn文案4集/共324个分P+bxD pagelist兜底splice入队; UP批量同修(cid=0→全部分P展开, cid解析前移到行渲染/skip判定前, UP skip首次生效)。仿真: 真bxD源码段+受控I/O(sim-up-batch.mjs 17✓: 5条→5次pagelist→12行→9次playurl→成功8跳过2失败2, 重试收敛; 对照组旧代码只出P1且skip永不命中), 附带修失败行隐身(p.parentNode||appendChild)。UI(v3.0.38): 进度行结构化b-idx等宽计数列+b-ep+b-st, b-cur outline描边代侧色条, batch-status块级, prefers-reduced-motion全关; A66断言。发布: manifest 3.0.36→3.0.38, verify92/acceptance16/selfcheck全绿, push master+tag v3.0.38+gh release。清理: 工作树干净(93追踪), 远端无冗余(89文件), 本地垃圾仅embedding边车(已忽略), kg sync(codegraph 365刷新)+wiki健康86/100零断链; GitHub .wiki.git仍以版本化docs站即Wiki承载。
