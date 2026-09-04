# Ruflo Integration Assessment

## Decision

Do not run Ruflo's initializer or install its dependency graph in NOETARCH yet. The candidate version is recorded, but activation requires dependency remediation and CEO approval.

## Official sources reviewed

- Repository: https://github.com/ruvnet/ruflo
- Codex adapter README: https://github.com/ruvnet/ruflo/blob/main/v3/%40claude-flow/codex/README.md
- Ruflo agent instructions: https://github.com/ruvnet/ruflo/blob/main/AGENTS.md
- Ruflo Claude instructions: https://github.com/ruvnet/ruflo/blob/main/CLAUDE.md
- Security policy: https://github.com/ruvnet/ruflo/blob/main/SECURITY.md
- Changelog: https://github.com/ruvnet/ruflo/blob/main/CHANGELOG.md
- Releases: https://github.com/ruvnet/ruflo/releases
- Instruction divergence issue #2638: https://github.com/ruvnet/ruflo/issues/2638
- Codex stdin issue #2947: https://github.com/ruvnet/ruflo/issues/2947
- Closing fix PR #2997: https://github.com/ruvnet/ruflo/pull/2997
- npm `ruflo`: https://www.npmjs.com/package/ruflo
- npm `@claude-flow/codex`: https://www.npmjs.com/package/%40claude-flow/codex

## Isolated initializer test

Command: `npx -y ruflo@3.38.21 init --dual --minimal`

The command exited 0 in a `mktemp -d` directory and generated these files:

```text
.agents/README.md
.agents/config.toml
.agents/skills/memory-management/SKILL.md
.agents/skills/ruflo/SKILL.md
.agents/skills/swarm-orchestration/SKILL.md
.claude-flow/.gitignore
.claude-flow/CAPABILITIES.md
.claude-flow/config.yaml
.claude/settings.json
.claude/skills/hooks-automation/SKILL.md
.claude/skills/pair-programming/SKILL.md
.claude/skills/skill-builder/SKILL.md
.claude/skills/sparc-methodology/SKILL.md
.claude/skills/stream-chain/SKILL.md
.claude/skills/swarm-advanced/SKILL.md
.claude/skills/swarm-orchestration/SKILL.md
.claude/skills/verification-quality/SKILL.md
.codex/AGENTS.override.md
.codex/config.toml
.gitignore
.mcp.json
AGENTS.md
CLAUDE.md
```

The generated instruction files diverged: `AGENTS.md` was 104 lines and `CLAUDE.md` was 173 lines with different SHA-256 digests. This reproduces the architectural concern in open issue #2638 and fails NOETARCH's single-source requirement.

Generated MCP configuration used `ruflo@latest`; Codex config enabled network access and parallel execution; Claude runtime config enabled automatic hooks. Running basic help/version commands also reported starting a background daemon, and `ruflo dual` was not exposed by the umbrella CLI. These defaults are incompatible with NOETARCH's initial boundary.

## Manual integration design after approval

1. Install only the exact reviewed tuple and commit a CEO-reviewed lockfile.
2. Use the local MCP entrypoint `node_modules/@claude-flow/cli/bin/mcp-server.js`; never `npx ...@latest`.
3. Keep tracked governance authored manually. Never run an initializer over the repository.
4. Enable only core orchestration, hierarchical swarms, shared memory, security auditing, and MetaHarness auditing.
5. Keep hooks, daemon/autopilot, federation, publishing, GitHub automation, network listeners, and unrestricted shell disabled.
6. Bind memory and sessions to ignored repository-local runtime paths and exclude secrets.
7. Run the nonce test, then the single read-only worker test, and record exact evidence.

