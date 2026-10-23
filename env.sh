# Source before running ./sm or any pipeline step:  source env.sh
# Picks a profile: cloud (Linux container, keys injected by the proxy) or mac (Apple Silicon, local keys).
# Override with SM_PROFILE=cloud|mac before sourcing.
SM_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]:-${(%):-%x}}")" && pwd)"
export SM_ROOT
if [ -z "${SM_PROFILE:-}" ]; then
  if [ "$(uname -s)" = Darwin ]; then SM_PROFILE=mac; else SM_PROFILE=cloud; fi
fi
export SM_PROFILE

# The narrated engine keeps its own venv (./sm calls it directly, so it stays off PATH and the code engine's
# python is untouched); only its settings and secrets (secrets.nosync/*.env, e.g. the Mac's DASHSCOPE_API_KEY) load here.
ATV_ROOT="$SM_ROOT/third_party/article-to-video"
export HF_HOME="$ATV_ROOT/models.nosync/hf" HF_HUB_ENABLE_HF_TRANSFER=0
for f in "$ATV_ROOT"/secrets.nosync/*.env; do [ -f "$f" ] && set -a && . "$f" && set +a; done

if [ "$SM_PROFILE" = cloud ]; then
  export DASHSCOPE_VIA_PROXY=1   # HTTPS_PROXY adds the real DashScope key
  export ATV_ASR=dashscope       # qwen3-asr-flash; mlx is Mac-only
  export CONCURRENCY="${CONCURRENCY:-4}"
fi
export GDRIVE_TOKEN_FILE="${GDRIVE_TOKEN_FILE:-$SM_ROOT/.gdrive_tokens.json}"
