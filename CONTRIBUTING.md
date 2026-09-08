# Contributing to NOETARCH

Contributions are welcome. NOETARCH is a security-first, local-first project; changes must
respect its governance and security invariants.

1. Read [`AGENTS.md`](AGENTS.md) (canonical governance), [`SECURITY.md`](SECURITY.md), and
   [`coordination/STATUS.md`](coordination/STATUS.md).
2. Set up your environment and run the quality gates as described in
   [`DEVELOPERS.md`](DEVELOPERS.md). All gates must be green.
3. Keep changes focused, match the surrounding style, and provide reproducible validation
   evidence. No feature may pretend to work — wire it or label it.
4. Do not add secrets, unpinned executable dependencies, autonomous background behavior, or
   GitHub automation. Provider keys are BYOK and live only in the encrypted vault.
5. Record material architecture, security, or governance decisions using the templates under
   `agents/templates/` (see `coordination/DECISIONS.md`).
6. Report security concerns privately as described in [`SECURITY.md`](SECURITY.md) — never in a
   public issue.

Contributors may prepare changes but may not commit, push, merge, tag, release, delete
branches, or change remotes. The maintainer controls all Git mutations and decides whether a
contribution is accepted.
</content>
