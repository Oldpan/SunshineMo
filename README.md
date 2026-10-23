# SunshineMo
AI 做视频强大的工具

## 开始

```bash
source env.sh     # 云端 / Mac 自动切换
./sm doctor       # 这台机器能跑什么
./sm list         # 所有视频
./sm new <slug> --series explainer --title "标题"   # 然后 sm build / verify / publish
```

每期视频一个目录、一个 `video.yaml`，成片只放 Google Drive，Git 里只有代码、配置和经验。总入口 skill：`.claude/skills/make-video/`。

## 文档

- [Google Drive API 使用笔记](docs/google-drive-api.md):授权流程、大文件上传脚本、踩坑记录
- [代码生成视频](video/README.md):通用库 `video/core/`、按系列组织的风格与集数;流程和经验沉淀在 skill `.claude/skills/code-video/`
- [视频风格 skill 索引](.claude/skills/README.md)：6 个第三方 skill，版本锁在 `skills/styles.lock`，按需拉取
- [第三方子模块](third_party/README.md):`third_party/article-to-video`,把文章做成带旁白的讲解视频,在另一个仓库维护
