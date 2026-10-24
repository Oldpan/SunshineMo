# Notion 视频清单

每期在云端 `./sm publish` 传完 Drive 后，会把这期加到 Notion 的视频清单页
（默认 https://app.notion.com/p/4031081a28be8062adc1dcf511ec4f05，可用 `NOTION_VIDEO_PAGE` 改）：

- 标题（二级标题）
- 16:9 封面
- 介绍（`介绍和文案.md` 里 `# 标题` 下面那段）
- 视频（Drive）链接 · 文件夹链接
- 分隔线

标题已经在页上就跳过；要改用 `./sm notion <slug> --replace`（删掉旧的那段，在页尾重新加）。
Notion 没更新成功不影响 Drive，按提示重跑 `./sm notion <slug>`。目标是数据库时，每期是一行（标题列、封面、
名字里带 链接/Drive/视频 的 URL 列、带 介绍/简介 的文本列会自动填）。

## 一次性设置

1. 在 https://www.notion.so/profile/integrations 建一个 internal integration，能力勾上读、更新、插入内容。
2. 打开视频清单页 > 右上角 ··· > Connections，把这个 integration 加进去。
3. 把 integration 的 secret 配到云环境：Network secrets 里加 `api.notion.com`（Bearer），或者环境变量 `NOTION_TOKEN`。
   Mac 上放在 `NOTION_TOKEN`（比如 `third_party/article-to-video/secrets.nosync/notion.env`，env.sh 会读）。

不走 Notion connector（用户的选择），只用 API。脚本是 `scripts/notion_sync.py`，只用标准库。
