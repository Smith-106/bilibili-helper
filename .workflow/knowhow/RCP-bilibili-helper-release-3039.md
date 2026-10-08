---
title: bilibili-helper合并器MEMFS泄漏修memory-access-OOB发布v3.0.39(maestro清理发布)
category: recipe
createdBy: dsh-agent
sourceRef: "commit:c16648a,tag:v3.0.39,repo:Smith-106/bilibili-helper"
---
根因: 长时间批量中途某集爆RuntimeError memory access out of bounds。wasm内存实测init 32MB/max 2048MB(可增长但有顶); 旧合并链每集在MEMFS留输出文件从不删(_0清理回调只删输入r/N不删输出t; 批量"删上一集"找本集新增而输出正是本集新增, 被ffmpegUsedFiles.delete移出集合后永不删), 几十集高清即顶爆。修(6处): _0清理回调加a.deleteFile(t)+失败路径三文件全删并重抛; a0对象URL 60s自回收(旧只q0登记永不revoke); t0合并失败行内显错✘+重抛(批量记失败而非✔, 修记账bug); beforeunload裸ffmpeg引用改q.ffmpegInstance?.守护。附带工艺: 实机注入验证panel+批量按钮4集/共324个分P; 合并长轮询改短轮询(工具单次30s上限); 打包口径复用v3.0.38(16条目=10扩展文件+6docs, 79KB级, 不含31MB wasm, wasm走扩展本地+J()/unpkg兜底)。发布: manifest 3.0.39, verify93(A67静态钉住6处)/acceptance16/selfcheck全绿, push master+tag v3.0.39+gh release(zip 80123B/16条目)。清理: 工作树干净(94追踪), 远端无冗余, 本地垃圾仅embedding边车(已忽略), 待kg sync+wiki健康复查。
