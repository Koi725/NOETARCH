#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

ruflo_bin="$repo_root/node_modules/.bin/ruflo"
namespace="noetarch-smoke"
nonce="${NOETARCH_SMOKE_NONCE:-a507b9f394f9ec55ef253f9f16c34072e4212907fbcbd093}"
action="${1:-}"

[[ -x "$ruflo_bin" ]] || { echo "BLOCKED: approved local Ruflo is not installed" >&2; exit 2; }

case "$action" in
  codex-store)
    "$ruflo_bin" memory store --namespace "$namespace" --key codex-to-claude \
      --value "$nonce" --upsert --scan-content --provenance tool_result
    stored="$($ruflo_bin memory retrieve --namespace "$namespace" --key codex-to-claude --value-only)"
    [[ "$stored" == "$nonce" ]] || { echo "FAIL: Codex value mismatch" >&2; exit 1; }
    echo "PARTIAL: CLI stored and verified codex-to-claude; MCP round trip still required"
    ;;
  codex-verify)
    expected="${nonce}:ACK"
    actual="$($ruflo_bin memory retrieve --namespace "$namespace" --key claude-to-codex --value-only)"
    [[ "$actual" == "$expected" ]] || { echo "FAIL: Claude acknowledgement mismatch" >&2; exit 1; }
    echo "PARTIAL: CLI verified acknowledgement; classify full test PARTIAL because MCP was not used"
    ;;
  *)
    echo "usage: NOETARCH_SMOKE_NONCE=<nonce> $0 codex-store|codex-verify" >&2
    exit 2
    ;;
esac

