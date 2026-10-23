#!/bin/sh
# Fetch the third-party video-style skills pinned in skills/styles.lock into .claude/skills/<name>/ (git-ignored).
#   sh scripts/fetch_skills.sh            fetch what is missing or at another commit
#   sh scripts/fetch_skills.sh --force    re-fetch everything
#   sh scripts/fetch_skills.sh latest     fetch each repo's HEAD and rewrite the pins in the lock file
# Only the skill directory is kept; showcase media and repo tests are dropped. Each keeps its upstream LICENSE.
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
LOCK=$ROOT/skills/styles.lock
DEST=$ROOT/.claude/skills
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

grep -v '^#' "$LOCK" | while IFS='|' read -r name repo commit path excludes; do
  [ -n "$name" ] || continue
  stamp=$DEST/$name/.fetched
  if [ "$1" != latest ] && [ "$1" != --force ] && [ "$(cat "$stamp" 2>/dev/null)" = "$commit" ]; then
    continue
  fi
  src=$TMP/$(echo "$repo" | tr / _)
  [ -d "$src" ] || git clone --quiet --filter=blob:none "https://github.com/$repo" "$src"
  if [ "$1" = latest ]; then
    new=$(git -C "$src" rev-parse HEAD)
    sed -i.bak "s#^$name|$repo|$commit|#$name|$repo|$new|#" "$LOCK" && rm -f "$LOCK.bak"
    commit=$new
  fi
  rm -rf "${DEST:?}/$name"
  mkdir -p "$DEST/$name"
  git -C "$src" archive "$commit:$path" | tar -x -C "$DEST/$name"
  (cd "$DEST/$name" && for e in $excludes; do rm -rf $e; done)
  [ -f "$DEST/$name/LICENSE" ] || cp "$src/LICENSE" "$DEST/$name/LICENSE"
  echo "$commit" > "$stamp"
  echo "$name <- $repo@$(echo "$commit" | cut -c1-7) ($(du -sh "$DEST/$name" | cut -f1))"
done
