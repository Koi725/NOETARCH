# Task Register

| ID | Task | Owner | Status | Gate / next action |
|---|---|---|---|---|
| GOV-001 | Review initial governance and RBAC | CEO + Senior Co-CTO | proposed | CEO approval required |
| GOV-002 | Select open-source license | CEO | blocked | CEO decision required |
| SEC-001 | Validate Ruflo critical/high advisory reachability for allowed scope | Security reviewer | proposed | Fresh upstream release or documented CEO risk decision |
| RUF-001 | Install exact local Ruflo graph and review lockfile | Orchestration Lead | blocked | SEC-001 and CEO activation approval |
| RUF-002 | Replace/disable pre-existing unpinned global Ruflo MCP entry for project use | CEO | blocked | CEO-only client configuration decision |
| COM-001 | Complete nonce round trip | Claude + Codex | blocked | RUF-001 and pinned MCP registration |
| COM-002 | Run one read-only Codex dual-mode fixture worker | Orchestration Lead | blocked | RUF-001, COM-001, explicit worker authorization |
| PROD-001 | Begin product implementation | GPT/Codex Co-CTO | in progress (frontend complete) | M0-M3 authorized and complete; backend integration, real APIs, and product-domain work blocked |
| FE-000 | Inspect and freeze the complete design handoff | GPT/Codex Co-CTO | complete with recorded source limitation | Four surviving fallback files verified with canonical paths and SHA-256 hashes; requested source directory and previously referenced README are absent and were not recreated |
| FE-001 | Initialize exact-pinned frontend foundation | GPT/Codex Co-CTO | complete | Exact pins and lockfile present; lint, strict type-check, tests, build, and dependency-tree validation pass |
| FE-002 | Implement design tokens and theme foundation | GPT/Codex Co-CTO | complete after remediation | Initially crossed the M1 stop; prospectively authorized by CEO after recovery review |
| FE-003 | Implement application shell and responsive navigation | GPT/Codex Co-CTO | complete after remediation | Future M3 destinations are accessible unavailable items, not broken links |
| FE-004 | Add tests and perform accessibility/config review | GPT/Codex Co-CTO | complete after remediation | 6 files/19 tests plus production-mode desktop dark/light, tablet, mobile, keyboard, motion, zoom, overflow, and contrast evidence in `docs/frontend/M2_ACCESSIBILITY.md` |
| FE-005 | Recover and remediate the M2 authorization boundary | GPT/Codex Co-CTO | complete | CEO-authorized source/docs remediation only; no backend, Ruflo, Git, or M3 effects |
| FE-006 | Implement M3 frontend screens and routes | Claude Senior Co-CTO | complete | 10 routes, 9 new components, typed mock data, 37 tests, 11-route build; evidence in `docs/frontend/evidence/m3/` and `docs/frontend/M3_IMPLEMENTATION.md` |
