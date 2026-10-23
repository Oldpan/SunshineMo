# third_party

这里放在别的仓库单独维护的项目，以 git 子模块的形式引用。SunshineMo 只记录它们的一个提交号，不复制代码。

| 目录 | 仓库 | 作用 |
|---|---|---|
| `article-to-video/` | [Oldpan/article-to-video](https://github.com/Oldpan/article-to-video)（私有） | 讲解片引擎：TTS 旁白 + ASR 自检、时间轴和混音、Remotion 渲染、校验，1920×1080 / 30fps。每期内容放在本仓库 `video/series/explainer/`，用 `./sm` 调它；方法见它自己的 `SKILL.md` 和 `LESSONS.md`。 |

## 常用命令

```bash
git submodule update --init                                 # 克隆后拉取子模块（浅克隆）
git submodule update --remote third_party/article-to-video  # 升级到它 main 的最新提交
git add third_party/article-to-video && git commit          # 再提交新的指针
```

- article-to-video 的代码改动在它自己的仓库里提交和推送。SunshineMo 这边只在需要时升级指针。
- 它是私有仓库。没有权限的人克隆 SunshineMo 时，这个目录是空的，不影响 `video/` 的使用。
- 云端会话不会自动拉子模块：先把 `Oldpan/article-to-video` 加进会话（add_repo），再执行 `git submodule update --init`。
- 默认旁白是云端 Qwen TTS。Mac 上 ASR 自检用本地 mlx；云端用 `ATV_ASR=dashscope`，`source env.sh` 会按机器自动设好，云端会话的 SessionStart hook 会装好它的依赖。
- 依赖方向只有一个：SunshineMo 调它，它不引用 SunshineMo，也不放每期内容。
