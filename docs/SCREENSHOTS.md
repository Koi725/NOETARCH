# Screenshots

Drop product captures here and reference them from the README's **Screenshots** section.
Keep them current with the shipped UI, and follow the neutral-docs rule: no personal,
employer, or organization details in any capture (blur or use demo data).

Capture in **demo mode** for populated, key-free screens:

```bash
./scripts/build.sh --seed
```

## Shots to include

| File | Screen | What it should show |
| --- | --- | --- |
| `run-summary.png` | Live run → run summary | The one-line narrative (found · merged · unique → screened → included → synthesised), the KPI grid, planned queries, and the deep-links into Evidence and Decisions. |
| `evidence-provenance.png` | Evidence | A frozen record with its source (OpenAlex / Crossref), DOI, and retrieval provenance. |
| `decisions.png` | Decisions | Pending screening claims with include/exclude/uncertain and the audit trail. |
| `synthesis.png` | Run summary → synthesis | Grounded findings, each citation resolving to an included, frozen paper. |

## Conventions

- Use a **1280×800** (or larger) viewport; capture both light and dark once the set is stable.
- Prefer PNG. Store files alongside this doc under `docs/` (e.g. `docs/screenshots/`).
- Name files exactly as in the table so the README placeholders can be swapped in directly.
</content>
