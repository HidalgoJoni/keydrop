#!/usr/bin/env bash
set -e

echo "Regenerating lockfiles and installing dependencies..."

for dir in frontend backend; do
  if [ -d "$dir" ]; then
    echo "Processing $dir"
    rm -rf "$dir/node_modules" "$dir/package-lock.json"
    (cd "$dir" && npm install --legacy-peer-deps)
  fi
done

echo "Done. Commit package-lock.json files if desired." 
