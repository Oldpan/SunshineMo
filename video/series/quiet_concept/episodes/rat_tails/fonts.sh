#!/usr/bin/env bash
# The dossier fonts (all OFL), fetched once per machine; fonts never go into git.
set -euo pipefail
D="${HOME}/.local/share/fonts/dossier"
mkdir -p "$D"
get() { [ -s "$D/$(basename "$1")" ] || curl -sSfL -o "$D/$(basename "$1")" "$1"; }
get https://raw.githubusercontent.com/notofonts/noto-cjk/main/Serif/OTF/SimplifiedChinese/NotoSerifCJKsc-Black.otf
get https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Black.otf
get https://raw.githubusercontent.com/google/fonts/main/ofl/zcoolkuaile/ZCOOLKuaiLe-Regular.ttf
get https://raw.githubusercontent.com/google/fonts/main/ofl/bagelfatone/BagelFatOne-Regular.ttf
echo "fonts in $D"
