# Google Drive API 使用笔记

在 Claude Code 云端会话里和 Google Drive 联动的两条路径、授权流程和踩过的坑。

## 两条路径,先选对

| | MCP 工具 (`mcp__Google_Drive__*`) | 直接调 REST API(`scripts/gdrive_*.py`) |
|---|---|---|
| 授权来源 | claude.ai 连接器,自带 | 环境变量 `GOOGLE_*` |
| 适合 | 搜索、读文件、建小文件、分享、回收站 | 大文件上传(已验证 100MB,约 7 秒) |
| 限制 | 文件内容必须作为工具参数传,**大文件传不了** | 需要有效的 refresh token |

结论:小文件和查询用 MCP;视频等大文件用脚本。两套授权互相独立,MCP 能用不代表 `GOOGLE_*` 凭据有效。

## 环境变量

会话环境需要提供(不要写进仓库):

- `GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`:OAuth 客户端。
- `GOOGLE_REFRESH_TOKEN`:长期令牌,用来换 1 小时有效的 access token。

## 获取 / 重新生成 refresh token

refresh token 不是一次性的,但会失效(见下方"踩坑")。重新生成步骤:

1. `python3 scripts/gdrive_auth.py url`,在浏览器里用目标 Google 账号打开输出的链接,点同意。
2. 浏览器跳到 `http://localhost/?code=4/0A...`,页面打不开是正常的。复制整个地址栏 URL。
3. `python3 scripts/gdrive_auth.py exchange '<整个 URL 或 code 值>'`,令牌写入 `.gdrive_tokens.json`(权限 600,已 gitignore,不会打印)。
4. 长期使用:把 refresh token 更新到环境里的 `GOOGLE_REFRESH_TOKEN`。脚本会优先读 `.gdrive_tokens.json`,没有再读环境变量。

授权码(`code=`)只能用一次,几分钟内有效;它不是 refresh token,换 token 还需要 client secret。

## 上传文件

```bash
python3 scripts/gdrive_upload.py 本地文件 [--name 云端名称] [--parent 文件夹ID | --folder 文件夹名[/子文件夹]]
```

用 resumable upload 流式上传,不会把文件读进内存。输出 JSON 含 `id`、`size`、`webViewLink`。上传后核对 `size` 与本地字节数一致。

`--folder` 按名字找本应用建过的文件夹,找不到就在"我的云端硬盘"根目录新建。`drive.file` 看不到你手动或用 MCP 建的同名文件夹,所以那种情况下会另建一个。 `--folder` 也可以写路径，比如 `video_from_opus/你来啦`，会逐级查找或新建；每个视频一个文件夹，放成片、两张封面和 `介绍和文案.md`。

## 踩坑记录

- **redirect_uri 必须和 OAuth 客户端里登记的逐字符一致。** 本项目登记的是 `http://localhost`(没有端口、没有结尾斜杠)。写成 `http://localhost:8080/` 会报 `redirect_uri_mismatch`。换 token 时也要带同一个 redirect_uri。如需修改,设 `GDRIVE_REDIRECT_URI`。
- **`invalid_grant`**:refresh token 失效。最常见原因是 OAuth 应用处于"测试"状态,此时 token 7 天过期。解决:Google Cloud Console → OAuth 同意屏幕 → 发布为"生产",**发布之后再重新生成** token(发布前签发的仍带 7 天限制)。其他原因:用户撤销授权、6 个月未使用、同账号同客户端签发的 token 超过 100 个。
- **设备码流程不可用。** 客户端不是"TV 和有限输入设备"类型,`/device/code` 会返回 `invalid_client`,只能走浏览器跳转。
- **scope 选择。** 默认 `drive.file`:只能访问本应用创建的文件,不属于敏感范围,通常无需审核,足够上传。它看不到 Drive 里已有的文件,也不能删 MCP 建的文件。需要完整读写时设 `GDRIVE_SCOPE=https://www.googleapis.com/auth/drive` 再走一遍授权。
- **"应用未验证"警告**:点"高级"→"继续"。账号需在同意屏幕的测试用户列表里(测试状态下)。
- **access token 只有 1 小时**,脚本每次运行都会用 refresh token 重新换,不用手动处理。

## Claude Code 的权限拦截

沙箱的自动模式分类器会拦截"读取 `GOOGLE_*` 凭据并换 token"这类命令(提示 `Credential Materialization`),在对话里口头同意没用,必须有 Bash 权限规则。本仓库 `.claude/settings.local.json` 已放行以下 curl 目标:

- `https://oauth2.googleapis.com/token`
- `https://www.googleapis.com/upload/drive/v3/`
- `https://www.googleapis.com/drive/v3/`

注意规则按 `curl` 命令匹配。用 `python3 scripts/...` 发请求不属于这些规则,如果被拦,可以补一条 `Bash(python3 scripts/gdrive_*)`,或者改用 curl 直接调。新建的 `.claude/` 目录如果会话启动时不存在,需要重启会话或打开一次 `/hooks` 才会被监听到。

## 安全约定

- 不要把 client secret、refresh token、授权码写进仓库、提交信息或对话。
- `.gdrive_tokens.json` 已在 `.gitignore` 中。
- 测试文件用完要清理。MCP 用 `trash_file`;用脚本上传的文件可以用同一份 token 调 `DELETE /drive/v3/files/{id}`。
