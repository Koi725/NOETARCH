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
| PROD-001 | Begin frontend/backend implementation | unassigned | blocked | Separate CEO phase-opening decision |

