# Repository Hygiene & Privacy Pass (M13, Part A)

Goal: make the public repository safe to share — no personal identity, no employer/org, no
local paths, no data files, no secrets — in the working tree, and flag anything already in
git history for remediation. **No git history was rewritten by this pass.** History
remediation and all commits are the repository owner's to run.

## 1. `.gitignore` — what it now covers

The root `.gitignore` was **extended** (no valid existing entries removed) with:

- **Databases & local state:** `*.db`, `*.sqlite`, `*.sqlite3`, `*.db-wal`, `*.db-shm`
- **Orchestration / coordination residue:** `.swarm/`, `.claude-flow/`, `ruvector.db`, `*.rvf`
  (already present) — retained.
- **Message bus / local project state:** `**/bus/v1/`, `.noetarch/`
- **Secrets & env:** `.env`, `.env.*` (present) plus `!*.env.example` / `!.env.example` to keep
  the example files tracked.
- **Local outputs / scratch:** `outputs/`, `*.local.*` (plus existing `tmp/`, `temp/`, caches).
- **OS / editor cruft:** `.DS_Store` (present), `Thumbs.db`, `.idea/`, `.vscode/`.

## 2. Tracked-file hits to un-track

`git ls-files` filtered by the hygiene patterns above returned **no matches** — no databases,
sqlite/WAL files, swarm/bus artifacts, `outputs/`, `.DS_Store`, or editor dirs are currently
tracked. Only `backend/.env.example` and `frontend/.env.example` match `.env*`, which is
intended (examples stay tracked).

**Proposed un-track commands: none required.** (If any local artifact is added later, the
owner would run, e.g.: `git rm --cached <path>` then commit.)

## 3. Documentation neutralized (before → after summary)

Personal/identifying content was removed from the working tree while keeping all engineering
substance (architecture, security posture, setup, API/contract docs, threat model).

- **Absolute local paths / username** — `docs/frontend/M0_HANDOFF_FREEZE.md` contained six
  `~/Downloads/...`-style absolute paths that embedded a local username. Rewritten to relative
  source references (`design_handoff_noetarch/<file>`); SHA-256 manifest and technical content
  preserved.
- **Side-project/brand name** — a predecessor prototype filename that carried an unrelated
  brand name was genericized to `predecessor-prototype.dc.html` (hash preserved).
- **Org-chart role-play → neutral roles** — across **29 tracked Markdown files** the fictional
  seat labels were replaced: `CEO → maintainer / repository owner`, `Senior (Claude) Co-CTO →
  the maintainer`, `GPT/Codex (Co-CTO) → the reviewer`, `Claude Code → the implementation
  agent`, `Co-CTO → reviewer`, `model-seat → role`, `org chart → roles overview`. Awkward
  duplicates from the swap (e.g. "CEO + Senior Co-CTO") were collapsed to a single role.
- **Verification after the pass:** `git grep` finds **no** remaining `/Users/…` paths, **no**
  remaining `CEO`/`Co-CTO` terms, and **no** brand residue in tracked files. No real name or
  email is present in the tracked tree.

**Still leaking (owner decision needed):** three files under `agents/roles/` still encode the
role-play in their **filenames** (their *contents* are neutralized): `CEO.md`,
`GPT_CODEX_CO_CTO.md`, `SENIOR_CLAUDE_CO_CTO.md`. Recommend renaming to neutral names (e.g.
`OWNER.md`, `REVIEWER.md`, `MAINTAINER.md`) or moving the internal governance trees
(`agents/`, `coordination/`, `orchestration/`) into a git-ignored `.noetarch/private/` if they
are planning-only and not meant to ship. Renames are left to the owner to avoid breaking
in-repo links.

## 4. Secret scan (working tree)

Scanned the tracked tree for `sk-…`, `Bearer …`, `password=…`, private-key headers,
`AKIA…`, `ghp_…`, `xox…`. **No secrets found.** The only `.env*` files tracked are the
`.env.example` templates, which contain placeholders only.

## 5. History audit (read-only) — verdict: **one identifier to remediate; no secrets**

Read-only inspection of all 167 commits:

- **Home path / username:** the string `/Users/<username>/…` appears in **exactly one commit**
  — `fcaf5a2` ("docs(frontend): freeze verified design handoff") — in the single file
  `docs/frontend/M0_HANDOFF_FREEZE.md`. This leaks a local home path (and thus a username) in
  history even though the working tree is now clean.
- **Email:** **not present** in any commit.
- **Secrets / API keys:** the targeted key regexes found **nothing**. (`git log -S"sk-"`
  surfaced only false positives — `Task-routing`, `no-decision-risk--…`, `queue-microtask` —
  no `sk-<key>`.)

### CEO ACTION REQUIRED — destructive, do not run automatically

To purge the home path/username from history, the repository owner (not the agent) should,
on a fresh clone, run **one** of:

```bash
# Option A — git-filter-repo (recommended)
pip install git-filter-repo
git filter-repo --replace-text <(printf '%s' '/Users/<username>==><repo-root>')

# Option B — BFG
bfg --replace-text replacements.txt      # replacements.txt: /Users/<username>==><repo-root>
```

Then:

```bash
git push --force-with-lease --all
git push --force-with-lease --tags
```

**Warnings:**
- History rewrite changes every downstream commit hash; coordinate with any collaborators and
  re-clone afterward.
- A force-push is irreversible for shared refs — review the rewrite before pushing.
- **No secret needs rotation** for this repo (none were ever committed). *If a secret ever had
  been pushed, a history purge would NOT un-leak it — the exposed credential must be rotated.*
  Recorded here as the standing rule, though it does not apply to the current history.

## 6. What this pass did not do

It did not run any git mutation, did not rewrite history, and did not delete/rename tracked
files. All edits are uncommitted and staged for the owner to review and commit.
