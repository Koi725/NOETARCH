# Handoff Protocol

A handoff must use `agents/templates/HANDOFF_TEMPLATE.md` and include:

- task ID, sender, receiver, timestamp, and authority basis;
- objective, completed work, exact changed paths, and current state;
- commands run and results, including failures and skipped checks;
- facts versus assumptions, unresolved risks, and pending approvals;
- active processes, local runtime state, namespaces, and cleanup status;
- next action and acceptance criteria.

Never include credentials or secret values. Memory keys may be named; sensitive values may not be copied. The receiver must verify the evidence and explicitly accept ownership. A handoff cannot widen permissions or imply approval.

