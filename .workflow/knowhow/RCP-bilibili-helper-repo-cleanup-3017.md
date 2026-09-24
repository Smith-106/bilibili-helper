---
title: bilibili-helper仓库清理+文档站+发布v3.0.17(maestro清理操作)
category: recipe
createdBy: pi-agent
sourceRef: "commit:e7f0ea0,tag:v3.0.17,repo:Smith-106/bilibili-helper"
---
清理: 删_metadata/(商店签名)/.workflow/(checkpoint+spec-analytics+tmp12M+sessions)/.pi注入/网页快照x3; .gitignore加固(工作流/签名/注入/快照/node/build/crx/zip/key)。文档: 新增README.md/CHANGELOG.md/docs站7页(index/getting-started/batch-download/risk-control/verification/architecture/KNOWLEDGE)+docs/WIKI.md索引; GitHub Pages source=master:/docs → https://smith-106.github.io/bilibili-helper/。发布: manifest 3.0.16→3.0.17, tag v3.0.17, gh release + bilibili-helper-3.0.17.zip(10MB)。远端: 新建公开仓Smith-106/bilibili-helper, push master+tag, 远程冗余计数0。Wiki: GitHub .wiki.git需网页建首页(无API), 故以版本化docs站即Wiki+docs/KNOWLEDGE.md即kg承载。