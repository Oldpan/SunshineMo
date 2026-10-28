#!/usr/bin/env bash
# The mid-century toon fonts (all OFL), fetched once per machine; fonts never go into git.
set -euo pipefail
D="${HOME}/.local/share/fonts/toon"
mkdir -p "$D"
get() { [ -s "$D/$(basename "$1")" ] || curl -sSfL -o "$D/$(basename "$1")" "$1"; }
get https://raw.githubusercontent.com/google/fonts/main/ofl/alfaslabone/AlfaSlabOne-Regular.ttf
get https://raw.githubusercontent.com/google/fonts/main/ofl/oleoscript/OleoScript-Bold.ttf
get "https://raw.githubusercontent.com/google/fonts/main/ofl/jost/Jost%5Bwght%5D.ttf"
get https://raw.githubusercontent.com/google/fonts/main/ofl/zcoolkuaile/ZCOOLKuaiLe-Regular.ttf
get https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Bold.otf
echo "fonts in $D"
