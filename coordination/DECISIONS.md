# Decision Register

| ID | Date | Status | Decision | Owner / approver | Evidence |
|---|---|---|---|---|---|
| D-001 | 2026-09-04 | active user mandate | `AGENTS.md` is canonical; `CLAUDE.md` is import plus Claude overlay | CEO | `AGENTS.md`, `CLAUDE.md` |
| D-002 | 2026-09-04 | active user mandate | Agents cannot perform Git mutations or remote Git operations | CEO | `AGENTS.md`, RBAC |
| D-003 | 2026-09-04 | provisional safety block | Do not install Ruflo in NOETARCH while the evaluated graph has unresolved critical/high advisories and unsafe generated defaults | GPT/Codex; CEO review pending | `orchestration/ruflo/SECURITY_BOUNDARY.md` |
| D-004 | 2026-09-04 | active user mandate | Communication remains unverified until Codex checks Claude's exact nonce acknowledgement | CEO | `orchestration/ruflo/COMMUNICATION_TEST.md` |
| D-005 | 2026-09-05 | active user mandate | Initial frontend authorization covered M0 design-handoff freeze and M1 foundation only; implementation was intended to stop before M2 | CEO | CEO correction following recovery review; `docs/frontend/M0_HANDOFF_FREEZE.md` |
| D-006 | 2026-09-05 | active user mandate | Frontend uses Next.js App Router, React, strict TypeScript, Tailwind, exact-pinned npm dependencies, and the canonical per-component/data/style folder convention | CEO | Current CEO instruction; `frontend/README.md` |
| D-007 | 2026-09-05 | observed recovery finding | M2 implementation began before the intended M1 stop; the recovery audit identified and isolated the boundary error | GPT/Codex Co-CTO; CEO reviewed | Recovery audit; `docs/frontend/M2_ACCESSIBILITY.md` |
| D-008 | 2026-09-05 | active user mandate | Effective from this decision and not retroactively, M2 is authorized for completion and remediation; M3, backend integration, real API calls, and product-domain implementation remain blocked | CEO | CEO decision following recovery review |
