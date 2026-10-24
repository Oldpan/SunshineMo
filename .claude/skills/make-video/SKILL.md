---
name: make-video
description: Start here for any video in this repo — explainer with narration, vibe short, mini-drama, MV, or a new style. Picks the engine and series, then drives the episode through ./sm (new, build, verify, publish to Google Drive).
---

# Make a video

Everything goes through `./sm` at the repo root (`./sm --help`). Each episode is
`video/series/<series>/episodes/<slug>/` with a `video.yaml` that names its engine, style and what to deliver.

## 1. Set up

```bash
source env.sh      # picks the cloud or mac profile; cloud: cloud TTS/ASR through the proxy
./sm doctor        # what this machine can run; fix any [--] line it names
```

In a cloud session the SessionStart hook (`scripts/session_start.sh`) has already installed both engines and fetched
the style skills. `third_party/article-to-video` is a private submodule: the session needs that repo added.

## 2. Pick the engine and series

| The ask | Series | Engine | Then read |
|---|---|---|---|
| Explain an article, paper, blog or release; Chinese narration | `explainer` | narrated (article-to-video) | `video/series/explainer/README.md`, then `third_party/article-to-video/SKILL.md` and `LESSONS.md` |
| Vibe short, mini-drama, beat-synced MV; no voice, 60fps | an existing series, or a new one | code (`video/core`) | `.claude/skills/code-video/SKILL.md`, then the series README |
| A look neither engine has yet | either of the above | either | `.claude/skills/README.md` (third-party style skills) |

`./sm list` shows every episode. Not sure about the look? Borrow xilo-opus-video's method: three clearly different
directions with a preview still each, and let the user pick before building.

## 3. Make it

```bash
./sm new <slug> --series <series> --title "标题" [--source URL]
./sm build <slug> --dry        # narrated: timeline from text length, no TTS
./sm build <slug> --preview    # narrated: half-size render; code: a few stills
./sm build <slug>              # full render + covers
./sm verify <slug>
```

Anything after `--` goes to the engine (`./sm build <slug> -- --range 56 64` for a code preview clip).

## 4. Deliver

- Write the publishing copy in the Mac format and nothing else: first line `# 标题`, a blank line, then one
  100–200 character introduction (whitespace not counted) on the real hook and who it is for. No alternative titles,
  references, disclaimers or hashtags. Narrated episodes keep it in `source/video.md` (the engine checks it; `sm new`
  delivers it as `介绍和文案.md`); code episodes write `介绍和文案.md` in the episode. `sm publish` refuses anything else.
- `./sm publish <slug>` delivers every file in `deliver.files`, depending on where it runs (`SM_PROFILE` from `env.sh`):
  - cloud: uploads to Drive `deliver.drive` (default `video_from_opus/<标题>/`), checks each size, writes the folder
    link and file ids back into `video.yaml`, and in a cloud thread also copies them to `/mnt/project-files/<标题>/`.
    Commit `video.yaml`.
  - Mac: copies them to the iCloud video library `$SM_ICLOUD_VIDEO/<deliver.drive 的最后一级>/` (default
    `~/Library/Mobile Documents/com~apple~CloudDocs/work-station/zmt/video/`, the same library article-to-video uses).
    Nothing goes to Drive unless you add `--drive`.
  - After the Drive upload it adds the video (title, 16:9 cover, introduction, Drive links) to the user's Notion
    video list; retry with `./sm notion <slug>`. Setup and layout: `docs/notion.md`.
- Drive needs `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` and a refresh token (`GOOGLE_REFRESH_TOKEN`, or
  `scripts/gdrive_auth.py`; see `docs/google-drive-api.md`).

## Where things belong

- Git holds code, `video.yaml`, scripts, copy and lessons. Videos, covers, audio and anything over 1 MB go to Drive;
  `.gitignore` and `.githooks/pre-commit` enforce it.
- A change to how narrated videos are made (TTS, ASR, timeline, Remotion layouts, styles) is an engine change: commit it
  in Oldpan/article-to-video, then bump the submodule here. Episode content never goes into that repo.
- A technique a second code series could use moves down into `video/core/` (see code-video).
