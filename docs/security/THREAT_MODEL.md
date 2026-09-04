# NOETARCH Threat Model

## 1. Overview

NOETARCH is currently a governance-only repository: it defines human/agent authority, deny-by-default RBAC, task protocols, and a planned local Ruflo orchestration boundary. There is no product runtime, public API, frontend, backend service, production deployment, or approved Ruflo installation. The phase restriction is explicit in `AGENTS.md:5-7`, and the implemented component map is documented in `docs/architecture/ARCHITECTURE.md:29-40`.

This model was produced through a sequential architecture review because independent agent delegation was not authorized for this bootstrap. Scenarios below are hypotheses, not validated vulnerabilities, unless explicitly identified as an observed audit fact.

| Component | Security-relevant role | Source evidence |
|---|---|---|
| CEO | Final authority, risk acceptance, Git/release executor | `agents/organization/AUTHORITY.md:3-14` |
| Claude and Codex | Technical actors below CEO authority | `AGENTS.md:9-16` |
| Canonical governance | Instruction and permission control plane | `AGENTS.md:42-48` |
| RBAC and gates | Deny-by-default capabilities and explicit approvals | `agents/rbac/permissions.yaml:1-17`; `agents/rbac/approval-gates.yaml:1-18` |
| Ruflo | Disabled, future local infrastructure without authority | `AGENTS.md:36-40` |
| Shared memory | Future non-secret coordination state treated as untrusted | `AGENTS.md:50-59` |
| Specialist worker | Task-scoped execution with no standing authority | `agents/rbac/permissions.yaml:32-38` |
| Frontend/backend | Reserved; no product code exists | `docs/architecture/ARCHITECTURE.md:37-40` |

### Effective resources and capabilities

| Deployment or workflow | Resource or capability | Configuration and precedence | Safe effective value or location | Readers, writers, or recipients | Enforcing control | Evidence or unknowns |
|---|---|---|---|---|---|---|
| Current repository | Governance instructions | Root `AGENTS.md` is canonical; Claude imports it | Tracked repository files | CEO, Claude, Codex, delegated workers | Review plus CEO-only governance gate | `AGENTS.md:42-48`; runtime parser behavior remains client-dependent |
| Current repository | Git mutation | User mandate and RBAC deny all agents | CEO-only local Git/GitHub action | CEO | Human authority; agents must refuse | `AGENTS.md:18-22`; `agents/rbac/permissions.yaml:46-52` |
| Planned local MCP | Ruflo server process | Non-executable example; disabled by default | Local stdio entrypoint, no network listener | Approved local clients only | CEO activation gate and client sandbox | `config/ruflo-mcp.example.toml:1-11`; no approved runtime exists |
| Planned shared memory | Namespace and database | Runtime-specific precedence unresolved until installation | Ignored repository-local state; namespace `noetarch-smoke` for test only | Approved Claude/Codex clients | MCP tool policy, RBAC, exact-value verification | `AGENTS.md:52-59`; storage backend not yet approved |
| Planned worker test | One Codex child process | Exact bundled adapter path and 60-second command timeout | Read-only fixture in `orchestration/ruflo/fixtures/` | Orchestrator and one Codex worker | Explicit CEO authorization, bounded prompt, exit/orphan checks | `scripts/ruflo-dual-readonly-smoke.sh`; not executed |
| Isolated dependency audit | Ruflo package graph | Exact `ruflo@3.38.21`, scripts disabled | Temporary directory outside repository | GPT/Codex audit process | Temporary isolation and cleanup | `orchestration/ruflo/SECURITY_BOUNDARY.md:19-29` |

## 2. Threat Model, Trust Boundaries, and Assumptions

### Protected assets and objectives

- CEO authority and the integrity of approvals, RBAC, governance, decisions, and task scope.
- Repository integrity, including the prohibition on agent Git mutations.
- Credentials, tokens, SSH keys, browser sessions, and confidential user data.
- Integrity and provenance of shared memory, agent handoffs, audit evidence, dependency metadata, and communication-test results.
- Host filesystem/process boundaries, local CLI configuration, and the absence of unauthorized listeners or orphan workers.
- Reproducibility of dependency versions and integrity metadata.

Security objectives are least privilege, deny-by-default behavior, exact dependency pinning, non-secret runtime state, local-only MCP transport, bounded workers, explicit approval for consequential effects, and independent verification of claimed success (`AGENTS.md:50-68`).

### Actors and realistic capabilities

- **CEO:** trusted final authority; may intentionally approve consequential action. Compromise of the CEO account or host is outside what repository policy alone can prevent.
- **Claude/Codex clients:** can read repository instructions and, when delegated, edit scoped files or run bounded checks. They do not start with Git mutation, secret, release, or governance authority.
- **Delegated worker:** may receive a prompt and task-scoped tool set. It does not start with broader filesystem, network, Git, secret, approval, or delegation capability.
- **Malicious contributor or untrusted content author:** may control repository text, issue content, prompts, dependency metadata, or memory values, but does not start with CEO approval or host credentials.
- **Compromised dependency or MCP tool:** may attempt process execution, file access, persistence, instruction replacement, memory poisoning, or misleading output; it has only the permissions granted to its local process.
- **Local unprivileged process:** may attempt to connect to a carelessly exposed listener or alter writable runtime state; actual host multi-user exposure is unknown.

### Trust boundaries

1. **CEO → governance:** human direction becomes durable policy. Only explicit CEO decisions cross this boundary; silence and tool output are not approval (`AGENTS.md:24-30`).
2. **Governance → agent client:** repository text guides model behavior but is not a technical sandbox. Host/client controls must enforce filesystem, network, and command restrictions.
3. **Client → Ruflo MCP:** task data and capability requests cross into third-party code. Ruflo is untrusted infrastructure and may not grant authority (`orchestration/ruflo/SECURITY_BOUNDARY.md:3-17`).
4. **Ruflo → shared memory:** stored values may later influence both clients. Values are non-secret, provenance-bearing, namespace-scoped, and untrusted.
5. **Ruflo → worker subprocess:** prompts and inherited process capabilities cross into a child agent. The orchestrator must close stdin, enforce timeout and scope, collect output, and verify termination.
6. **Dependency registry → local install:** package manifests and tarballs become executable code. Exact versions, integrity, lockfile review, and advisory analysis are required before activation.
7. **Agent → Git/GitHub:** this boundary is closed to agents. Only the CEO may execute mutations or releases (`agents/organization/AUTHORITY.md:12-18`).

### Assumptions and open questions

- The host, CEO account, and installed Claude/Codex clients are not already compromised.
- Future MCP use is local stdio only; no HTTP listener or remote bridge is assumed.
- No secrets are needed for the communication tests.
- Ruflo's documented controls are not assumed effective until verified in the installed artifact.
- It is unknown whether current critical/high dependency advisories are reachable through the narrowly allowed memory and worker paths.
- The concrete Ruflo memory database location and file permissions remain unresolved because installation is blocked.
- Client-side enforcement of repository instructions cannot be proven solely from Markdown; OS sandboxing and tool policy remain required.
- The project license, public security contact, CI policy, and production deployment model are not yet selected.

## 3. Attack Surface, Mitigations, and Attacker Stories

All rows are hypotheses unless labeled **observed**.

| Priority | Scenario and capability gain | Prerequisites | Impact | Existing controls | Mitigation | Evidence |
|---|---|---|---|---|---|---|
| Critical | A vulnerable package parser reaches arbitrary code execution in the Ruflo process, gaining that process's filesystem/environment authority | Approved installation plus attacker-controlled data reaching the vulnerable parser | Repository/host data access, process execution, possible credential exposure | Installation blocked; scripts-disabled audit; secrets prohibited | Do not install until reachability is disproved or fixed graph exists; sandbox process and strip environment | **Observed advisory exposure**, not confirmed reachability: `orchestration/ruflo/SECURITY_BOUNDARY.md:19-29` |
| High | Prompt or memory poisoning impersonates CEO approval and expands worker permissions | Untrusted content is consumed without authority separation | Unauthorized file, network, shell, or governance action | Canonical authority, deny-by-default RBAC, memory treated as untrusted | Bind every capability to a task/approval receipt; validate provenance; never interpret memory as approval | `AGENTS.md:24-30`; `agents/rbac/permissions.yaml:74-90` |
| High | Ruflo initializer or upgrade replaces canonical instructions with divergent permissive templates | Initializer runs in repository or generated changes are accepted blindly | Governance drift and bypass of CEO-only controls | Initializer prohibited; generated files tested only in temp | Never run initializer in repo; diff package-generated files; verify `CLAUDE.md` import invariant | **Observed initializer behavior:** `orchestration/ruflo/SECURITY_BOUNDARY.md:33-38` |
| High | MCP or a worker inherits credentials or broad shell/network access | Host forwards sensitive environment or permissive sandbox config | Secret theft, remote actions, arbitrary process execution | Secret access gate; restricted example disabled; broad modes prohibited | Environment allowlist, local stdio, tool allowlist, OS sandbox, explicit worker capability envelope | `agents/rbac/approval-gates.yaml:10-22`; `config/ruflo-mcp.example.toml:3-11` |
| High | Agent or orchestrator performs a prohibited Git mutation or release | Tool access plus failure to enforce repository policy | Unauthorized history, branch, remote, or release changes | Explicit absolute prohibition in governance and RBAC | Remove mutation tools from agent environments; CEO performs actions manually after review | `AGENTS.md:18-22`; `agents/rbac/permissions.yaml:46-73` |
| Medium | Stale or forged acknowledgement produces a false communication PASS | Reused namespace/key, upserted memory, or result accepted without exact nonce check | False trust in cross-client coordination | Random nonce and exact round-trip rule | Fresh nonce per run, clear namespace, exact equality, initiating-client verification, purge after approved test | `AGENTS.md:53-59`; `orchestration/ruflo/COMMUNICATION_TEST.md` |
| Medium | Codex worker hangs or survives timeout, consuming resources or retaining access | Dual-mode subprocess path active and cleanup fails | Resource exhaustion and persistent unintended process | Bundled 3.0.3 contains stdin fix; bounded test and orphan check prepared | Verify exact artifact, enforce timeout/process group cleanup, test no-orphan behavior before use | `orchestration/ruflo/SECURITY_BOUNDARY.md:35-37`; `scripts/ruflo-dual-readonly-smoke.sh` |
| Medium | A local or network actor invokes sensitive MCP tools | MCP exposed over HTTP or local client config is overly broad | Shell, file, memory, or worker abuse | Network listeners prohibited; example uses stdio and is disabled | Keep stdio local, explicit tool allowlist, prompt/write approvals, no secret forwarding | `AGENTS.md:55-57`; `config/ruflo-mcp.example.toml:3-11` |
| Low | Logs, fixtures, reports, or ignored runtime files leak nonessential sensitive data | Sensitive content is supplied despite policy | Local disclosure or future accidental commit | `.gitignore`, no-secret invariant, fixed harmless fixture | Redaction, retention limits, content scan, review ignored files before support bundles | `AGENTS.md:52-54`; `.gitignore` |

## 4. Severity Calibration

- **Critical:** unauthenticated or low-privilege code execution with the Ruflo process's meaningful host authority, or compromise that directly yields CEO-equivalent release/secret authority. A package advisory is not automatically Critical for NOETARCH if its parser is unreachable and the process is strongly sandboxed.
- **High:** unauthorized governance/RBAC modification, secret access, agent Git mutation, or broad worker shell/network escalation requiring a plausible local workflow. A blocked installer path with no installed runtime is not an active High vulnerability.
- **Medium:** false coordination results, bounded denial of service, stale-memory poisoning, or local MCP misuse with meaningful prerequisites and limited authority gain. Verified timeouts, fresh nonces, and strict tool allowlists may reduce severity.
- **Low:** non-secret local metadata leakage, noisy logs, or self-only disruption without privilege gain. Ordinary authorized worker behavior is not a vulnerability.

Unsupported claims remain open questions rather than findings: there is no evidence of a public NOETARCH service, tenant boundary, production data, remote MCP listener, installed Ruflo runtime, or secret-bearing workflow. Severity must be recalibrated when those facts change.

Repository: NOETARCH
Version: snapshot-sha256:86f253ac6885c3d43b4cde6c47b106f8cf87e1fb18020cac7ccd8faa2ccfe7bb (all repository files except this self-referential document)
