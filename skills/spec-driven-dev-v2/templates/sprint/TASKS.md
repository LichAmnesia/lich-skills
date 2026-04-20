# Tasks — [sprint slug]

Single source of truth for task status in this sprint. Update on every state
change. `governance-check.sh` asserts this stays in sync with git and review files.

Statuses:

- `pending` — spec written, not started
- `building` — worktree open, commits landing
- `built` — verify green, awaiting review
- `in_review` — Context Pack sent, review in flight
- `changes_requested` — review round closed with findings to address
- `merged` — approved review exists, branch merged to sprint integration
- `blocked` — human intervention needed; set `blocked_reason`
- `abandoned` — spec retired; record reason in the TK file

| # | Task | Status | Worktree / branch | Last commit | Rounds | Verdict | Notes |
|---|------|--------|-------------------|-------------|--------|---------|-------|
| TK-001 | [boundary-script](tasks/TK-001-boundary-script.md) | pending | — | — | 0 | — | |
| TK-002 | [arch-tests](tasks/TK-002-arch-tests.md) | pending | — | — | 0 | — | depends TK-001 |
| TK-003 | [ci-integration](tasks/TK-003-ci-integration.md) | pending | — | — | 0 | — | depends TK-002 |

## Invariants (enforced by governance-check.sh)

- A task in `merged` must have at least one file `reviews/RV-<id>-round*.md` with `verdict: approve` or `approve_with_nits`.
- A task in `in_review` must have `current_round ≥ 1` in `STATE.json`.
- A task in `changes_requested` must have an unresolved finding in the latest review file.
- No two tasks may share a worktree/branch.
- `Rounds` column ≤ 5 without a human note in `Notes`.
