# Ruflo Version Record

**Investigated:** 2026-09-04 using official npm metadata and the official Ruflo GitHub repository.

## Resolved candidate graph

| Package | Exact version | Status | Node | License | Integrity / provenance |
|---|---:|---|---|---|---|
| `ruflo` | `3.38.21` | npm `latest`, `alpha`, and `v3alpha`; GitHub latest release, published 2026-09-02 | `>=20.0.0` | MIT | `sha512-29ehBGRswxX77PlgKZsBm9SNeJgMXWe0OtrNdaL51OlJmsPo2Uqn942AlCeqk1hy8lmxrOytHiPfDJozDdwNzQ==` |
| `@claude-flow/cli` | `3.38.21` | transitive CLI selected in isolated install | package manifest did not publish an `engines` field in queried metadata | MIT | `sha512-t+ZgH0rVu28yzZskXgxAHQG+0m4gT/lRA5693dX7D91jpeLWWbpigJpUO860XOELSfdo669hrZl+ST/tFMvewA==` |
| bundled `@claude-flow/codex` | `3.0.3` | bundled inside CLI; contains PR #2997 stdin fix | `>=18` | MIT | covered by the CLI tarball integrity; not separately published in npm version metadata |
| standalone `@claude-flow/codex` | `3.0.2` | public npm `latest`, published 2026-07-28; older than bundled fix | `>=18` | MIT | `sha512-T8PclwTu+lw/pOLDtVD2giDcoUYcKRquxZ7/U8LdYcoD50BVVKka+9nQ8UM4PGLRBg5dPdbYPFRg00/DCe+FIA==` |

The only tested compatible tuple was `ruflo@3.38.21` → `@claude-flow/cli@3.38.21` → bundled `@claude-flow/codex@3.0.3`. Direct `npm view @claude-flow/codex@3.0.3` returned 404, so consumers cannot independently pin that bundled component.

The GitHub release notes identify 3.38.21 as an MCP HTTP bridge memory-persistence fix and disclose another bundled-but-unpublished package gap. The root `CHANGELOG.md` did not contain a 3.38.x entry when checked, so GitHub Releases and npm metadata—not the stale changelog—were used for current release status.

## Local compatibility

- Node: `v26.4.0` — satisfies both declared ranges.
- npm: `11.17.0`.
- Codex CLI: `0.153.2`.
- Claude Code: `2.1.195`.

## Installation state

The tuple was installed only under an isolated `/tmp/noetarch-ruflo-audit.*` directory with package scripts disabled for dependency inspection. No Ruflo package or lockfile was installed in NOETARCH. Repository activation is `BLOCKED` by the findings in `SECURITY_BOUNDARY.md`.
