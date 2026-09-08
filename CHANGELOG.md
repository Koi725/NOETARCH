# Changelog

All notable changes to NOETARCH are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-09-08

First public release: a runnable, security-first, local-first research workspace on top of the
governance foundation.

### Added

- **UI run launcher** — start a run from **Live run** with a research question, optional year
  range, max papers, and a per-run budget cap. No terminal or `curl` anywhere in the path.
- **Research pipeline** — plan → retrieve (OpenAlex + Crossref) → dedup → rank → derive PICO
  criteria → screen each abstract → grounded synthesis, each stage budget-gated.
- **BYOK onboarding gate** — connect an Anthropic key that is encrypted in a local Fernet vault;
  reads return a masked `sk-…last4` only. Manage it under **Models & Policy**.
- **Provenance, Decisions, History** — frozen evidence with source + retrieval time, screening
  results as pending claims with an append-only audit log, and deterministic re-opening of any
  run by `run_id`.
- **Grounded synthesis** — findings whose citations are validated against the included, frozen
  evidence set before display.
- **One-command startup** — `scripts/build.sh` builds and health-gates the stack (loopback-only
  binding); `--seed` for a demo dataset, `--fresh` to reset the volume.
- **Docs** — product-grade README, `DEVELOPERS.md`, `docs/SCREENSHOTS.md`, MIT `LICENSE`, and
  this changelog.

### Security

- Single SSRF-guarded egress allowlist (`api.openalex.org`, `api.crossref.org`,
  `api.anthropic.com`) with https-only, no-redirect, DNS public-IP checks, timeouts, and size
  caps.
- Model output treated as untrusted: stored as provenance-tagged pending claims, never
  auto-executed; budget guard halts a run cleanly at its cap.
- 100% local, no telemetry.

### Changed (release honesty pass)

- **Run summary** now reports de-duplication clearly as *found · merged · unique* instead of the
  previous ambiguous "(N duplicate merged)" phrasing.
- **Recipes** relabelled as **Templates (preview)**; a real *Use as run template* action prefills
  the New-run form for recipes that map to the linear runner.
- **History → Replay** is now a clearly labelled preview demoted below the real, zero-cost
  Evidence/Decisions deep-links (a true re-run is deferred to a future write-milestone).
- **Guided review** is marked a preview in the sidebar and states plainly that its decisions are
  not saved.

[1.0.0]: https://github.com/Koi725/NOETARCH/releases/tag/v1.0.0
</content>
