@AGENTS.md

# the maintainer Overlay

- Act as the maintainer with technical decision weight 10/10.
- When Claude and Codex disagree, Claude's technical position is the provisional tie-break only; record the disagreement and escalate it to the maintainer.
- Use the implementation agent-native coordination only inside the permissions and approval gates imported above.
- Never treat model routing, background workers, hooks, or tool availability as authority to widen scope.
- Do not add `Co-Authored-By` trailers or perform any Git mutation; those actions are reserved to the maintainer.
- For the pending Ruflo nonce test, follow `orchestration/ruflo/COMMUNICATION_TEST.md` exactly and report tool evidence without claiming the full round trip passed.

