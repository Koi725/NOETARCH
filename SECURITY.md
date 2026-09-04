# Security Policy

## Scope

Security review currently covers governance files, agent authority and RBAC, orchestration configuration, dependency provenance, shared-memory communication, and worker process boundaries. No product runtime exists yet.

## Invariants

- The CEO is the only release authority and the only actor allowed to perform Git mutations or change GitHub settings.
- Ruflo, models, workers, hooks, memory, and audit tools cannot grant permissions or approve their own output.
- Secrets must not enter tracked files, prompts, shared memory, logs, fixtures, or reports.
- Dependencies must be exact, integrity-recorded, lockfile-reviewed, and free of unresolved risk beyond the CEO's documented acceptance.
- External input and persisted memory are untrusted and must not change authority.
- Network services default to disabled and loopback-only when explicitly enabled.
- Automated shell, publishing, federation, GitHub automation, and unbounded background execution are prohibited.

## Reporting a vulnerability

Do not disclose a suspected vulnerability in a public issue. Report it privately to the repository owner through a CEO-designated private channel. Include affected paths and versions, reproduction steps that avoid destructive effects, impact, prerequisites, and suggested mitigation. A public security contact will be added only after the CEO approves one.

## Handling reports

Preserve evidence, minimize access, do not expose secrets, and do not run a proof of concept against systems outside the explicitly authorized repository scope. Security hypotheses are not findings until validated.

## Current dependency gate

Ruflo repository installation is blocked. The isolated audit of `ruflo@3.38.21` produced unresolved critical and high npm advisories; details and scope limitations are recorded in `orchestration/ruflo/SECURITY_BOUNDARY.md`.

