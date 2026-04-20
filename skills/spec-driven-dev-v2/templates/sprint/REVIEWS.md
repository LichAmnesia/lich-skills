# Reviews — [sprint slug]

Chronological log of every review round across all tasks in this sprint.
One line per round. Round files live in `reviews/RV-<task-id>-round<N>.md`.

| Round file | Task | Date | Reviewer | Verdict | Critical | Required | Resolved in |
|------------|------|------|----------|---------|----------|----------|-------------|
| [RV-001-round1](reviews/RV-001-round1.md) | TK-001 | 2026-MM-DD | critic-subagent | request_changes | 2 | 3 | round2 |
| [RV-001-round2](reviews/RV-001-round2.md) | TK-001 | 2026-MM-DD | critic-subagent | request_changes | 0 | 1 | round3 |
| [RV-001-round3](reviews/RV-001-round3.md) | TK-001 | 2026-MM-DD | critic-subagent | approve | 0 | 0 | — |

## Round budget

Each task has a soft budget of 5 rounds. If `current_round > 5`:

- Orchestrator MUST stop and surface to human.
- Usually means: task spec is wrong, scope too large, or reviewer is
  chasing style in `Critical:`. Fix the input, don't grind rounds.

## Invariants (enforced by governance-check.sh)

- Every row references a file that exists.
- A task's last row before `merged` status must have verdict ∈ {approve, approve_with_nits}.
- Verdicts monotonically de-escalate within a task: `request_changes` → `approve_with_nits` → `approve`.
  Regressing (approve → request_changes) means the task was merged too early; flag it.
- No two rounds for the same task may have the same `Date` (UTC date) without explicit note.
