# the implementation agent ↔ Codex Communication Test

## Current result

- Shared-memory round trip: **BLOCKED**
- Headless dual-mode worker: **BLOCKED**
- Reason: no approved pinned Ruflo installation exists in NOETARCH.

The prepared namespace is `noetarch-smoke`. The generated nonce for the first authorized run is:

```text
a507b9f394f9ec55ef253f9f16c34072e4212907fbcbd093
```

It has not been stored. Do not mark the test started until an approved local MCP server is registered.

## Preconditions

1. maintainer approves `ruflo@3.38.21` or a safer replacement version and the exact lockfile.
2. Project-scoped Codex and Claude MCP registrations invoke the reviewed local MCP entrypoint, not `@latest`.
3. `codex mcp list` and the Claude equivalent show the intended server enabled.
4. Autopilot, federation, hooks, publishing, GitHub automation, network listeners, and background daemons are disabled.
5. No secret-bearing environment variables are forwarded.

## Test A — nonce round trip

1. From Codex, prefer the registered MCP `memory_store` tool with:

```json
{"namespace":"noetarch-smoke","key":"codex-to-claude","value":"a507b9f394f9ec55ef253f9f16c34072e4212907fbcbd093","upsert":true}
```

2. Retrieve it from Codex and verify exact equality before asking Claude to act.
3. Give Claude the exact prompt below. Claude must retrieve the stored value and write `<nonce>:ACK` under `claude-to-codex` in the same namespace.
4. Codex retrieves `claude-to-codex` through the registered MCP tool and verifies exact equality with:

```text
a507b9f394f9ec55ef253f9f16c34072e4212907fbcbd093:ACK
```

5. Record PASS only after step 4. If only `scripts/ruflo-memory-smoke.sh` CLI fallback works, record PARTIAL.

### Exact the implementation agent prompt

```text
You are performing NOETARCH communication test COM-001. Read AGENTS.md and orchestration/ruflo/COMMUNICATION_TEST.md first. Use only the already registered, approved local Ruflo MCP server. Do not run any Git mutation, network operation, initializer, package install, hook, daemon, swarm, or worker. In Ruflo namespace `noetarch-smoke`, retrieve key `codex-to-claude`. It must equal exactly `a507b9f394f9ec55ef253f9f16c34072e4212907fbcbd093`. If it differs or cannot be retrieved through MCP, stop and report BLOCKED without writing anything. If it matches, store key `claude-to-codex` with exact value `a507b9f394f9ec55ef253f9f16c34072e4212907fbcbd093:ACK` in the same namespace, then retrieve it once to verify exact equality. Report the MCP tool names used and their success/failure. Do not claim the end-to-end test passed; Codex must independently retrieve and verify the acknowledgement.
```

## Test B — one read-only Codex worker

After Test A passes and the maintainer separately authorizes a worker, run `scripts/ruflo-dual-readonly-smoke.sh`. It launches one Codex worker with a 60-second timeout, permits reading only `orchestration/ruflo/fixtures/worker-input.txt`, requires exact content and SHA-256 output, and then checks dual status and the process marker. No Git command or write is part of the worker prompt.

PASS requires correct fixture output, exit code 0, completed worker status, and no matching orphan process. Any missing evidence is PARTIAL or FAIL; an unavailable approved runtime is BLOCKED.

