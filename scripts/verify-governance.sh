#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

required=(
  AGENTS.md CLAUDE.md README.md SECURITY.md CONTRIBUTING.md CODE_OF_CONDUCT.md .gitignore
  agents/organization/ORG_CHART.md agents/organization/AUTHORITY.md
  agents/rbac/roles.yaml agents/rbac/permissions.yaml agents/rbac/approval-gates.yaml
  agents/protocols/TASK_LIFECYCLE.md agents/protocols/HANDOFF.md agents/protocols/CONFLICT_RESOLUTION.md
  coordination/STATUS.md coordination/TASKS.md coordination/DECISIONS.md
  orchestration/ruflo/INTEGRATION.md orchestration/ruflo/VERSION.md
  orchestration/ruflo/SECURITY_BOUNDARY.md orchestration/ruflo/COMMUNICATION_TEST.md
  docs/architecture/ARCHITECTURE.md docs/security/THREAT_MODEL.md
)

for path in "${required[@]}"; do
  [[ -s "$path" ]] || { echo "missing or empty: $path" >&2; exit 1; }
done

[[ "$(head -n 1 CLAUDE.md)" == "@AGENTS.md" ]] || {
  echo "CLAUDE.md must import @AGENTS.md on line 1" >&2
  exit 1
}

if rg -n '@latest' config scripts/ruflo-memory-smoke.sh scripts/ruflo-dual-readonly-smoke.sh --glob '!*.md'; then
  echo "unpinned executable Ruflo reference found" >&2
  exit 1
fi

echo "governance structure: PASS"
