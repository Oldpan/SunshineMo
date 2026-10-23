# explainer · 讲透

engine: narrated

把一篇文章、博客、论文或产品更新讲清楚的中文讲解片：Qwen 龙安欢配音，字幕跟着配音走，Remotion 画面，1920×1080 / 30fps。
引擎是子模块 `third_party/article-to-video`。这里只放每期的内容，引擎改动在它自己的仓库提交。

## 每期目录

```
episodes/<slug>/        slug = Remotion 的 composition id：小写字母、数字、短横线
  video.yaml            标题、引擎、风格、交付清单；sm publish 在末尾写回 Drive 记录
  script.yaml           旁白脚本，写法见 article-to-video 的 references/script.md
  source/               article.md（原文和所有用到的资料）、video.md（标题 + 100–200 字介绍）、小配图
  scenes/               自定义场景：index.tsx 导出 id = '<slug>' 和 registry，场景文件和它同级，用 '@atv/lib/...' 引用渲染器
  介绍和文案.md          发布用的标题、简介、话题
  out/                  不进 git
```

## 流程

```bash
source env.sh
./sm new <slug> --series explainer --title "标题" --source <URL>
# 写 source/article.md、script.yaml；通用版式不够时再写 scenes/
./sm build <slug> --dry              # 按字数估时长，先看画面
./sm build <slug> --preview          # 配音 + 半分辨率
./sm build <slug>                    # 正式 1080p + 封面
./sm verify <slug>                   # check_beats + 成片按时间轴回听、截图拼板
./sm publish <slug>                  # 上传 Drive，写回 video.yaml
```

工作方法、版式、画风、品牌素材和审片标准都以 article-to-video 的 `SKILL.md` 和 `LESSONS.md` 为准，开工前读一遍。
画风：`style:` 先用渲染器自带的 `flat` / `paper` / `pixel` / `crayon`（每个场景也能在 `script.yaml` 里单独指定）；想换别的画风先看 `.claude/skills/README.md`。

## 集数

| 集 | 标题 | 成片 |
|---|---|---|

（之前的 10 期在 article-to-video 的 `projects/` 里，留在原处。）
