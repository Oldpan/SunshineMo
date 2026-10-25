# Notion：发布话题总表

每期视频传完 Drive（云端 `./sm publish`）后，用 Notion connector 把它登记到用户的「发布大集合」页里的数据库
**发布话题总表**（页面 https://app.notion.com/p/4031081a28be8062adc1dcf511ec4f05，
data source `collection://06e0027d-e885-42ee-9316-3020f5e68082`）。动手前先 fetch 这个页面，按它写的使用方式和迁移规则来。

## 一行一个话题

- 先查表里有没有同一话题（文章、短贴可能已经有了）。有就把视频作为新版本加进那一行，不新建重复话题，也不动其他版本的内容。
- 没有就新建一行：`话题` = 视频标题（`介绍和文案.md` 的 `# 标题`），图标 🎬。
- `视频·状态`：默认 `待确认`（发到平台后用户自己改）。
- `视频·正文`：指向这一行页面本身的 mention，`<mention url="<行页面 url>">标题</mention>`。建好行之后再填。

## 页面里的「## 视频」分区

1. 16:9 封面：`notion-create-file-upload` 拿上传地址，用 curl 按返回的 header POST 文件（`file` 字段），再写 `<image source="file-upload://<id>" />`。
2. 介绍：`介绍和文案.md` 标题下面那段，原样。
3. `[视频（Drive）](https://drive.google.com/file/d/<mp4 id>/view) · [文件夹](<Drive 文件夹 url>)`，id 在 `video.yaml` 的 `drive:` 记录里。

Mac 上做的片子不传 Drive（存 iCloud），登记时没有 Drive 链接就先不填链接那行，或者问用户。
