#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

adapter="$repo_root/node_modules/@claude-flow/cli/node_modules/@claude-flow/codex/dist/cli.js"
fixture="orchestration/ruflo/fixtures/worker-input.txt"
marker="NOETARCH_DUAL_SMOKE_a507b9f394f9ec55"

[[ -f "$adapter" ]] || { echo "BLOCKED: approved bundled Codex adapter is not installed" >&2; exit 2; }
[[ -r "$fixture" ]] || { echo "FAIL: fixture missing" >&2; exit 1; }

expected_hash="$(shasum -a 256 "$fixture" | awk '{print $1}')"
prompt="${marker}: Read only ${fixture}. Return its exact single line and SHA-256 ${expected_hash}. Do not write any file, run Git, access another path, use network, spawn another worker, or start a background process. Exit immediately after reporting."

node "$adapter" dual run \
  --worker "codex:readonly-fixture:${prompt}" \
  --namespace noetarch-smoke \
  --max-concurrent 1 \
  --timeout 60000

node "$adapter" dual status --namespace noetarch-smoke

if pgrep -fl "$marker"; then
  echo "FAIL: matching worker process remains" >&2
  exit 1
fi

echo "Headless command exited and no matching worker marker remains; verify recorded output before PASS"

