# Project Plan: [Project Title]

> Derived from: RFC.md
> Status: [draft | approved | in progress | done]
> Last updated: [YYYY-MM-DD]

## Sprint map

One row per sprint. Sprints are shippable checkpoints — each sprint's
"Exit artifact" must be demoable or behind a flag, not half-done.

| # | Sprint slug | Goal | Exit artifact | Depends on | Size |
|---|-------------|------|---------------|------------|------|
| 1 | baseline-setup | Lay tracks: repo, CI, skeleton | Green CI on `main` | — | S |
| 2 | core-domain | Domain types + persistence | Schema + unit tests green | 1 | M |
| 3 | api-surface | Public endpoints + validation | Postman collection passes | 2 | M |
| 4 | ui-shell | Frontend shell + first flow | Flag-gated page reachable | 3 | M |
| 5 | polish-ship | Perf, a11y, docs, rollout | Feature flag at 100% | 4 | S |

Size: S ≤ 6 tasks, M 7–10, L 11–15 (split), XL forbidden.

## Dependency graph

```
sprints-001-baseline-setup
        │
        ├─▶ sprints-002-core-domain
        │         │
        │         ├─▶ sprints-003-api-surface
        │         │         │
        │         │         └─▶ sprints-004-ui-shell
        │         │                       │
        │         │                       └─▶ sprints-005-polish-ship
```

Prefer vertical slices. If sprint N can't demo anything without sprint N+1, merge them.

## Architecture decisions

Non-obvious decisions and the reason.

- **Decision:** [e.g. Layered: L0 (pure), L1 (domain), L2 (IO). L0 must not import L2.]
  **Rationale:** [Cycle-prevention + testability. Enforced via ast-grep rule — see `artifact-registry/rules/RULE-001-layering.md`.]
- **Decision:** [...]
  **Rationale:** [...]

Rejected alternatives:

- **Rejected:** [Event sourcing]. **Why:** [Overkill at current scale. Revisit if write volume > 10× current.]

## Cross-sprint invariants

Things that must hold after **every** sprint close:

- [ ] `main` is green
- [ ] No task merged without an approved review (`governance-check.sh` passes)
- [ ] No orphaned feature flags older than this sprint + 1
- [ ] All `artifact-registry/rules/` entries with `enforcement: lint` have a live lint rule

## Parallelization

- **Safe to parallelize:** [e.g. sprint 3 API + sprint 4 UI shell, once contract is frozen in sprint 2]
- **Contract-first:** [tasks that need an agreed interface before splitting]
- **Must be sequential:** [...]

## Milestones

| Date | Milestone |
|---|---|
| [YYYY-MM-DD] | Sprint 1 closed |
| [YYYY-MM-DD] | Sprint 3 closed — first internal demo |
| [YYYY-MM-DD] | Sprint 5 closed — flag 100% |

## Sign-off

- [ ] Every sprint has an exit artifact
- [ ] Dependencies ordered correctly
- [ ] No sprint is XL
- [ ] Architecture decisions captured with rationale
- [ ] Human approved
