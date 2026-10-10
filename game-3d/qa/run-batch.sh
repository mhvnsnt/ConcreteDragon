#!/bin/bash
# Run a list of shots sequentially. Usage: run-batch.sh shot1 shot2 ...
cd ~/workspace/ConcreteDragon-video/game-3d
for shot in "$@"; do
  echo "=== starting $shot ==="
  timeout 5400 node qa/cap-shot.mjs "$shot" 2>&1 | tail -2
  echo "=== done $shot ==="
done
echo "BATCH COMPLETE"
