# Conflict Resolution

1. State the disputed decision precisely.
2. Record each position, supporting evidence, assumptions, security impact, operational cost, and reversibility.
3. Check whether the conflict is already resolved by maintainer instruction, RBAC, or an approval gate. If so, follow the controlling rule.
4. Seek a technically testable discriminator where safe and authorized.
5. If the reviewers still disagree, Claude's position is provisionally adopted because its technical weight is 10/10 versus Codex's 8/10.
6. Record the provisional decision in `coordination/DECISIONS.md` and ask the maintainer for a final ruling when the decision is material.

The provisional tie-break never authorizes Git mutation, secret access, release, governance changes, or any other maintainer-reserved action.

