# 项目 Wiki

本目录（`docs/`）即本项目的 **Wiki / 知识库**，由 GitHub Pages 托管于
<https://smith-106.github.io/bilibili-helper/>。

> 说明：GitHub 的独立 `.wiki.git` 需要在网页端手动创建首个页面才会生成（REST/GraphQL/git push 均无此接口）。本项目采用「文档站即 Wiki」的方式：全部 Wiki 内容以 Markdown 维护在 `docs/`，随代码版本化、可评审、可离线检索，等价于 Wiki 职能且更可控。

## 页面索引

| 页面 | 内容 |
|------|------|
| [快速开始](./getting-started.md) | 安装、模式、清晰度、常见问题 |
| [批量下载指南](./batch-download.md) | 合集批量、UP 主全部视频批量、速度档、断点续传、-799 处理 |
| [风控与安全语义（R3）](./risk-control.md) | 节奏/退避/去重/降级约束表、沙盒 vs 真机、设计红线 |
| [验证与证据](./verification.md) | 三条验收命令、harness 覆盖、evidence 目录说明 |
| [架构与文件说明](./architecture.md) | 文件清单、关键模块、数据流、存储键 |
| [知识库 / 决策记录（kg）](./KNOWLEDGE.md) | Spec 约束 S1–S8、Knowhow 排错经验、变更溯源 |

## 维护

- 改行为 → 更新对应 `docs/*.md` + `docs/KNOWLEDGE.md` 的 Spec/Knowhow。
- 发版 → 更新 `CHANGELOG.md` 与本页「版本」标注。
- Wiki 内容随 git 提交进入版本控制，与代码同评审。

当前版本：`3.0.20`
