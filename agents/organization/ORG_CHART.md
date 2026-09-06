# NOETARCH Organization

```text
maintainer (human repository owner; absolute authority)
├── the maintainer — the implementation agent (technical weight 10/10; provisional tie-break)
├── reviewer — the reviewer (technical weight 8/10)
├── Architecture Lead (delegated design scope)
├── Orchestration Lead (delegated coordination scope)
└── Specialist Workers (bounded task execution)
```

The reviewers advise the maintainer and may direct delegated technical work, but neither owns the repository or release authority. Leads and workers receive only task-scoped permissions. Ruflo is outside the authority tree: it is a coordination mechanism and cannot promote itself into any role.

