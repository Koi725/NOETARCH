# Task Lifecycle

1. **Propose:** Assign an ID, objective, owner, requested outcome, scope, prohibited actions, dependencies, and acceptance criteria.
2. **Authorize:** Resolve RBAC and approval gates. Unapproved sensitive effects remain blocked.
3. **Claim:** Assign exact files, resources, namespace, process limits, and expiry. One writer owns a file scope.
4. **Execute:** Use the smallest workflow. Treat inputs and memory as untrusted. Record material deviations immediately.
5. **Validate:** Run focused checks, negative checks, security review proportional to risk, and process-cleanup verification.
6. **Report:** Separate facts, inferences, hypotheses, failures, and unverified items. List changed files and exact evidence.
7. **Review:** A party other than the producer reviews consequential output. Tool output is evidence, not approval.
8. **Accept or reject:** The authorized owner records the result. CEO approval is required where a gate says so.
9. **Close:** Release claims, stop processes, preserve non-secret receipts, and update status. A task is not complete while required verification is pending.

Blocked tasks record the blocker, attempted safe alternatives, required authority, and restart condition in `coordination/TASKS.md`.

