#!/bin/bash
# Universal Rig Standard runner — Concrete Dragon
# Runs every character model in this repo through the canonical pipeline
# (mhvnsnt/western-heart tools/rig_repair). Never touches inputs, never merges.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PIPE_URL="https://github.com/mhvnsnt/western-heart.git"
PIPE_DIR="${PIPE_DIR:-$REPO_ROOT/.rig-pipeline}"
OUT_DIR="${OUT_DIR:-$REPO_ROOT/rig-out}"

usage() {
  echo "Usage: $0 --in MODEL.glb [--tag TAG] | --batch"
  echo "  --in     repair one model"
  echo "  --batch  repair every character model (see MODEL_GLOBS below)"
  exit 1
}

# Per-repo character model locations (from the roster inventory).
MODEL_GLOBS=(
  "game-3d/build/assets/*.glb"
)

fetch_pipeline() {
  if [ -d "$PIPE_DIR/tools/rig_repair" ]; then
    git -C "$PIPE_DIR" pull --quiet 2>/dev/null || true
  else
    git clone --filter=blob:none --depth 1 --sparse "$PIPE_URL" "$PIPE_DIR"
    git -C "$PIPE_DIR" sparse-checkout set tools/rig_repair
  fi
  echo "pipeline: $PIPE_DIR/tools/rig_repair"
}

run_one() {
  local model="$1" tag="$2"
  mkdir -p "$OUT_DIR/$tag"
  python3 "$PIPE_DIR/tools/rig_repair/pipeline.py" \
    --in "$model" --outdir "$OUT_DIR/$tag" --tag "$tag"
}

[ $# -eq 0 ] && usage
fetch_pipeline
mkdir -p "$OUT_DIR"

case "$1" in
  --in)
    [ $# -lt 2 ] && usage
    MODEL="$2"; TAG="${4:-$(basename "$MODEL" .glb)}"
    run_one "$MODEL" "$TAG"
    ;;
  --batch)
    for g in "${MODEL_GLOBS[@]}"; do
      while IFS= read -r -d '' f; do
        TAG="$(basename "$f" | sed 's/\.[^.]*$//')"
        echo "=== $TAG ==="
        run_one "$f" "$TAG" || echo "FAILED: $f (continuing)"
      done < <(find "$REPO_ROOT" -path "$REPO_ROOT/$g" -print0 2>/dev/null)
    done
    ;;
  *) usage ;;
esac

echo "done. outputs in $OUT_DIR (versioned, inputs untouched)"
