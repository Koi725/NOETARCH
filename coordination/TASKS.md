# Task Register

| ID | Task | Owner | Status | Gate / next action |
|---|---|---|---|---|
| GOV-001 | Review initial governance and RBAC | the maintainer | proposed | maintainer approval required |
| GOV-002 | Select open-source license | maintainer | blocked | maintainer decision required |
| SEC-001 | Validate Ruflo critical/high advisory reachability for allowed scope | Security reviewer | proposed | Fresh upstream release or documented maintainer risk decision |
| RUF-001 | Install exact local Ruflo graph and review lockfile | Orchestration Lead | blocked | SEC-001 and maintainer activation approval |
| RUF-002 | Replace/disable pre-existing unpinned global Ruflo MCP entry for project use | maintainer | blocked | maintainer-only client configuration decision |
| COM-001 | Complete nonce round trip | the review roles | blocked | RUF-001 and pinned MCP registration |
| COM-002 | Run one read-only Codex dual-mode fixture worker | Orchestration Lead | blocked | RUF-001, COM-001, explicit worker authorization |
| PROD-001 | Begin product implementation | the reviewer | in progress (frontend complete) | M0-M3 authorized and complete; backend integration, real APIs, and product-domain work blocked |
| FE-000 | Inspect and freeze the complete design handoff | the reviewer | complete with recorded source limitation | Four surviving fallback files verified with canonical paths and SHA-256 hashes; requested source directory and previously referenced README are absent and were not recreated |
| FE-001 | Initialize exact-pinned frontend foundation | the reviewer | complete | Exact pins and lockfile present; lint, strict type-check, tests, build, and dependency-tree validation pass |
| FE-002 | Implement design tokens and theme foundation | the reviewer | complete after remediation | Initially crossed the M1 stop; prospectively authorized by maintainer after recovery review |
| FE-003 | Implement application shell and responsive navigation | the reviewer | complete after remediation | Future M3 destinations are accessible unavailable items, not broken links |
| FE-004 | Add tests and perform accessibility/config review | the reviewer | complete after remediation | 6 files/19 tests plus production-mode desktop dark/light, tablet, mobile, keyboard, motion, zoom, overflow, and contrast evidence in `docs/frontend/M2_ACCESSIBILITY.md` |
| FE-005 | Recover and remediate the M2 authorization boundary | the reviewer | complete | maintainer-authorized source/docs remediation only; no backend, Ruflo, Git, or M3 effects |
| FE-006 | Implement M3 frontend screens and routes | the maintainer | complete | 10 routes, 9 new components, typed mock data, 37 tests, 11-route build; evidence in `docs/frontend/evidence/m3/` and `docs/frontend/M3_IMPLEMENTATION.md` |
| FE-007 | M4 frontend/backend integration contract | the maintainer | complete | `src/contracts/` (10 files), `src/services/` (10 interfaces + mocks), 15 components refactored to service seam; 52 tests, 0 lint/type errors; contract documented in `docs/architecture/API_CONTRACTS.md` |
| BE-001 | M5 Evidence vertical slice (real API, seed data, no egress) | the maintainer | complete | `backend/.../modules/evidence/` (schemas/seed/repository/service/router/THREAT); `GET /api/v1/evidence{,/{id}}`; frontend `EvidenceService` async client + loading/error; no external network |
| BE-002 | M6 backend read-integration for remaining 7 surfaces | the maintainer | complete | Today, LiveRun, Decisions, GuidedReview, Recipes, History, ModelsPolicy modules + endpoints + async clients + loading/error; write/interactive actions stay simulated; `docs/PLATFORM_OVERVIEW.md` added |
| BE-003 | M7 persistence layer (seed → database, read-only) | the maintainer | complete | SQLAlchemy 2.0 ORM per domain in `infrastructure/`; repositories map ORM→Pydantic; Alembic create-only initial migration; `core/database.py` (env-driven URL, gitignored SQLite default); seed CLI; readiness checks DB. 177 backend tests (incl. migration + byte-parity), ruff/mypy clean; responses byte-identical; frontend unaffected. No writes, no egress, no auth. |
