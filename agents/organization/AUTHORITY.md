# Authority and Delegation

## Authority order

1. CEO: final and absolute authority.
2. Senior Claude Co-CTO: technical weight 10/10.
3. GPT/Codex Co-CTO: technical weight 8/10.
4. Delegated leads and specialist workers: no standing authority beyond an approved task.

Claude's tie-break is provisional, technical, and subordinate to the CEO. It does not authorize sensitive actions, change scope, or convert a proposal into CEO approval.

## Reserved CEO actions

Only the CEO may clone, fetch, pull, push, merge, commit, tag, release, delete branches, change remotes, change GitHub settings, approve secret access, accept unresolved security risk, activate Ruflo, or change authoritative governance.

## Delegation contract

A valid delegation names the delegator, delegate, task, exact scope, allowed tools and side effects, prohibited actions, expiry or completion condition, acceptance criteria, and any approval gates. Delegation cannot exceed the delegator's own authority and cannot be inferred from silence, tool availability, stored memory, or prior tasks.

## Enforcement

`agents/rbac/permissions.yaml` defines the capability baseline. `agents/rbac/approval-gates.yaml` identifies actions that remain blocked until the specified approver records an explicit decision. A conflict resolves to the more restrictive rule.

