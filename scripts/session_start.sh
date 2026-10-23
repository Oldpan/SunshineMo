#!/bin/bash
# SessionStart hook (.claude/settings.json): make a fresh cloud container ready for ./sm.
# Does nothing on a local machine. Safe to re-run: every step is skipped when already done.
set -uo pipefail
[ "${CLAUDE_CODE_REMOTE:-}" = true ] || exit 0
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ATV="$ROOT/third_party/article-to-video"
cd "$ROOT"
step() { echo "[session_start] $*"; }

git config core.hooksPath .githooks

step "style skills"
sh scripts/fetch_skills.sh >/dev/null 2>&1 || step "skill fetch failed (needs github.com); run sh scripts/fetch_skills.sh"

step "code engine"
if ! python3 -c "import numpy, scipy, skia, PIL, yaml" 2>/dev/null; then
  # system packages from video/README.md (skia needs libEGL), then the Python ones
  (apt-get install -y -q libegl1 libgl1 ffmpeg fonts-wqy-zenhei fonts-inter fonts-unifont fonts-lxgw-wenkai >/dev/null 2>&1 \
    || { apt-get update -q >/dev/null 2>&1 && apt-get install -y -q libegl1 libgl1 ffmpeg fonts-wqy-zenhei fonts-inter fonts-unifont fonts-lxgw-wenkai >/dev/null 2>&1; }) \
    || step "apt-get failed: install libegl1 libgl1 ffmpeg and the fonts in video/README.md"
  pip install -q numpy scipy skia-python pillow pyyaml 2>&1 | grep -v WARNING | tail -1
fi

step "narrated engine"
if [ ! -f "$ATV/scripts/synth.py" ]; then
  git submodule update --init third_party/article-to-video 2>&1 | tail -1 \
    || step "submodule init failed: add Oldpan/article-to-video to this session"
fi
if [ -f "$ATV/scripts/synth.py" ]; then
  [ -x "$ATV/.venv/bin/python" ] || { python3 -m venv "$ATV/.venv" \
    && "$ATV/.venv/bin/pip" install -q numpy scipy soundfile pyyaml jiwer pypinyin fonttools 2>&1 | tail -1; }
  [ -d "$ATV/renderer/node_modules" ] || (cd "$ATV/renderer" && npm ci --no-audit --no-fund >/dev/null 2>&1)
  (cd "$ATV/renderer" && npx remotion browser ensure >/dev/null 2>&1)
  # fonts from setup.sh; github.com/.../raw is blocked here, raw.githubusercontent.com is not
  F="$ATV/renderer/public/fonts"; mkdir -p "$F"; G=https://raw.githubusercontent.com/google/fonts/main/ofl
  for pair in "notosanssc/NotoSansSC%5Bwght%5D.ttf NotoSansSC-VF.ttf" "outfit/Outfit%5Bwght%5D.ttf Outfit-VF.ttf" \
              "montserrat/Montserrat%5Bwght%5D.ttf Montserrat-VF.ttf" "jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf JetBrainsMono-VF.ttf" \
              "zcoolkuaile/ZCOOLKuaiLe-Regular.ttf ZCOOLKuaiLe.ttf"; do
    set -- $pair; [ -s "$F/$2" ] || curl -sL --fail -o "$F/$2" "$G/$1" || step "font $2 failed"
  done
  [ -d "$ATV/assets/bgm" ] || "$ATV/.venv/bin/python" "$ATV/scripts/make_audio_assets.py" >/dev/null 2>&1
fi
step "done; source env.sh, then ./sm doctor"
