---
title: "UI反馈系列v3.0.28-3.0.30: 千集批量可读性+取消即时+冷却倒计时+当前集定位"
category: decision
createdBy: pi-agent
sourceRef: "repo:Smith-106/bilibili-helper,tag:v3.0.30"
---
背景: 批量下载 1159 集时长列表把面板撑满半屏且无法回滚；冷却 5min 期间点取消假死（bx2 不可中断）；当前处理集在列表中无定位；结束无耗时对照。决策（零逻辑回退,纯增强）: v3.0.28 `#batch-progress` 滚动(280px)+成败行浅底色+卡片化+收起态 toggle 小型化; v3.0.29 `bx2c` 可中断等待(500ms 粒度查 `bx0.cancel`,冷却/集间可即时取消)+原地冷却倒计时 `剩X分Y秒`+集间等待提示; v3.0.30 当前集 `.b-cur` 浅蓝底+色条+脉动+完成移除、取消按钮即时 disable、结束行 `用时X分Y秒`、progress 近底 60px 阈值自动跟随(手动上滚不打断)。harness: A39/A40-A42/A43-A46 静态,verify62/acceptance16/selfcheck51 全绿。
