# Ruflo Security Boundary

## Classification

Ruflo is an untrusted local orchestration dependency operating below NOETARCH governance. Its configuration, memory, hooks, workers, and audit results cannot grant authority.

## Allowed future capabilities

- Coordinate tasks already approved under RBAC.
- Run bounded hierarchical workers with exact scope and timeouts.
- Store non-secret shared memory in a dedicated namespace.
- Collect status and results.
- Run security and MetaHarness audits as non-authoritative evidence.

## Disabled capabilities

Autopilot, federation, automatic publishing, GitHub automation, unrestricted background loops, automatic hooks, remote listeners, unrestricted shell, secret access, governance modification, permission changes, and self-approval.

## Isolated audit findings

An exact `ruflo@3.38.21` install with scripts disabled resolved 718 dependencies and `npm audit --json` reported 39 advisories: 1 critical, 14 high, and 24 moderate. Material paths included:

- `protobufjs` arbitrary code execution and related injection/DoS advisories through `onnx-proto` / `onnxruntime-web`.
- `toml` prototype pollution and uncontrolled recursion affecting the CLI path.
- `fast-uri` SSRF/host-confusion advisories.
- `sharp`/libvips and `adm-zip` memory-safety/denial-of-service advisories.
- OpenTelemetry baggage/header denial-of-service paths.

This is dependency-audit evidence, not proof that every advisory is reachable in the restricted NOETARCH scope. It is sufficient to block a security-first installation until reachability is reviewed or an upstream fixed graph is available.

Official Ruflo security history also includes GHSA-c4hm-4h84-2cf3, an unauthenticated MCP bridge RCE affecting versions below 3.16.3. The selected 3.38.21 is newer, but NOETARCH still prohibits remote MCP exposure.

## Process and instruction risks

- Open issue #2638 documents divergent generated instruction files; isolated testing reproduced divergence.
- Issue #2947 documented Codex workers blocked on unclosed stdin. Merged PR #2997 closes stdin, and the fix is present in bundled `@claude-flow/codex@3.0.3`.
- Basic umbrella CLI help/version calls reported starting a background daemon. The audit daemon was stopped and Ruflo then reported no running daemons.
- Generated files contain unpinned `@latest`, automatic hooks, network-enabled workspace execution, and permissive profiles.

## Activation gate

maintainer approval requires an exact lockfile, current audit with no unexplained critical/high reachable path, reviewed local-only MCP configuration, initializer diff evidence, clean process-shutdown evidence, and confirmation that authoritative governance cannot be overwritten.

