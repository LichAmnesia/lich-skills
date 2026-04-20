---
name: spec-driven-dev-v2
description: Use when an agent will work for hours or days across many files and multiple vertical slices. Drives a three-level Project → Sprint → Task hierarchy with isolated per-task execution, a review round-loop, context packs for subagent reviewers, governance-as-code, and orchestrator-readable state. Designed for long-running drivers like /loop, autoresearch:ship, and goal-driven.
---

# Spec-Driven Development v2

v1 assumed one agent shipping one feature in one session. v2 assumes an
orchestrator (or a human) driving the agent across many sessions — possibly
for days — and keeps work correct the entire time.

v2 adds:

1. **Three-layer hierarchy** — Project → Sprint → Task
2. **Per-task state** — JSON files an orchestrator can read to resume cold
3. **Review round-loop** — review → feedback → modify → re-review until clean
4. **Worktree isolation** — every task runs in a clean checkout, revertable alone
5. **Context pack** — the briefing a reasoning-blind subagent reviewer needs
6. **Mechanical task gate** — sizing/acceptance/rollback checks enforced by script
7. **Governance-as-code** — boundary rules live in lint/CI, not markdown
8. **Artifact registry** — new rules captured from reviews graduate to lint

## When to use v2 over v1

Use v2 if any of:

- Expected agent time > 4 hours
- More than ~8 tasks, or more than one vertical slice
- A subagent (`/critic`, `Agent subagent_type=critic`, etc.) reviews each task
- An orchestrator (`/loop`, `autoresearch:ship`, `goal-driven`) drives iteration
- Architectural boundaries (layering, dependency direction) must hold mechanically

For one-session features, use `spec-driven-dev` (v1) — v2 is overhead for them.

## The Hierarchy

```
context/
  dev/
    projects-001-<slug>/                # one project = one RFC
      RFC.md                            # the contract: what & why
      PLAN.md                           # sprint list + dependency graph
      STATE.json                        # {current_sprint, status}
      sprints-001-<slug>/               # one sprint = one checkpoint
        SPRINT.md                       # goal, scope, exit criteria
        TASKS.md                        # task status tracker
        REVIEWS.md                      # review round log
        STATE.json                      # {current_task, current_round, next_action}
        tasks/
          TK-001-<slug>.md              # one task = one worktree
          TK-002-<slug>.md
        reviews/
          RV-001-round1.md              # round 1 for TK-001
          RV-001-round2.md              # after modify, round 2
          RV-001-round3.md              # …until verdict=approve
      sprints-002-<slug>/
        …
  artifact-registry/
    rules/
      RULE-001-<slug>.md                # captured pattern → lint rule
scripts/
  governance-check.sh                   # boundary + state validator
  task-lint.sh                          # mechanical task gate
```

All state is on disk. No in-memory plan. This is the contract with the
orchestrator: it can read `STATE.json`, pick up where the last session left
off, and advance one step.

## Roles

- **Planner** — writes RFC, PLAN, SPRINT, TASK specs. No code.
- **Builder** — implements one task in an isolated worktree.
- **Reviewer (subagent)** — reasoning-blind. Sees only the Context Pack.
- **Orchestrator** — reads STATE.json, dispatches the next role.

Planner and Builder may be the same model. Reviewer **must** be a fresh
subagent with no access to Builder's conversation — that is what makes review
work.

## Phase 0: PROJECT (one-time per project)

**Goal.** Produce the RFC and sprint plan. No code.

1. Draft `RFC.md` from `templates/project/RFC.md` — restate request, list
   assumptions, define measurable success, set Always/Ask/Never boundaries.
2. Draft `PLAN.md` from `templates/project/PLAN.md` — decompose into sprints.
   Each sprint must have a shippable checkpoint (even if behind a flag).
3. Initialize `STATE.json` with `current_sprint: "sprints-001-<slug>"`.
4. Human approves RFC and PLAN before any sprint opens.

**Exit criteria.**

- [ ] RFC.md committed and approved
- [ ] PLAN.md committed with ≥ 2 sprints (or 1 if scope is truly small)
- [ ] No sprint is XL (> ~10 tasks); split if it is
- [ ] STATE.json present and valid

## Phase 1: SPRINT (one-time per sprint)

**Goal.** Expand one sprint into atomic, independently-reviewable tasks.

1. Write `SPRINT.md` from `templates/sprint/SPRINT.md` — goal, scope, exit
   criteria, what's deferred.
2. Write one `tasks/TK-NNN-<slug>.md` per task, from `templates/task/TASK.md`.
3. Write `TASKS.md` from `templates/sprint/TASKS.md` — flat status table.
4. Run `scripts/task-lint.sh <sprint-dir>` — every task must pass:
   - Has acceptance criteria as a bullet list
   - Has an executable verify command
   - Files list ≤ 5 (else size must be L with justification; XL forbidden)
   - Has a `rollback:` line
   - Title contains no "and"
5. Initialize sprint `STATE.json` with `current_task: "TK-001"`, `current_round: 0`.
6. Human approves the sprint.

**Exit criteria.**

- [ ] SPRINT.md + all TK files + TASKS.md committed
- [ ] `task-lint.sh` exits 0
- [ ] No XL tasks
- [ ] STATE.json valid

## Phase 2: BUILD — per task, in isolation

Every task runs in a **fresh git worktree** (or branch on a clean tree). This
is non-negotiable — it is what makes review and rollback possible.

**Steps.**

1. Orchestrator reads sprint `STATE.json`, picks `current_task`.
2. Create worktree: `git worktree add ../wt-TK-NNN -b tk-NNN-<slug>`.
3. Builder reads **only** the task file + files it lists. No sprint-wide
   browsing.
4. Implement. Commit in thin slices. Every commit leaves tree green.
5. Run the task's `verify:` command. If red, fix. Do not claim done on red.
6. Update `TASKS.md`: status `built`, link commit range.
7. Update `STATE.json`: `next_action: "review"`, `current_round: 1`.

**Scope discipline.** Touch only files listed in the task. If you need a file
that isn't listed, stop, update the task spec, get re-approval. "While I'm
here" refactors are a phase violation.

**Exit criteria (per task).**

- [ ] All commits on `tk-NNN-<slug>` branch, tree green
- [ ] Verify command exits 0
- [ ] No files changed outside task's declared set
- [ ] `TASKS.md` + `STATE.json` updated

## Phase 3: REVIEW — the round loop

Review is a **state machine**, not a one-shot.

```
  built ──▶ round1 ──┬──▶ approve ──▶ merged
                     │
                     └──▶ request_changes ──▶ modify ──▶ roundN+1
```

A task may not advance to `merged` until a review with `verdict: approve`
exists. Every round creates its own `reviews/RV-NNN-roundN.md`.

**Each round:**

1. Builder (or orchestrator) constructs a **Context Pack** — see
   `templates/review/REVIEW.md` "Context Pack" section. This is the brief the
   reviewer subagent will see. It includes:
   - Task file (TK-NNN) and relevant RFC/SPRINT anchors
   - `git diff <base>..HEAD` scoped to declared files
   - `git log --oneline` on the branch
   - Verify command output (actual stdout, not "passed")
   - Prior rounds' unresolved findings (round N-1 marked `[unresolved]`)
   - Relevant lint/governance script output
2. Spawn a reasoning-blind reviewer subagent (e.g. `Agent subagent_type=critic`)
   with the Context Pack as its only input.
3. Reviewer writes `RV-NNN-roundN.md` using the 5-axis template. Verdict is
   one of: `approve` / `approve_with_nits` / `request_changes` / `reject`.
4. Append a one-line entry to `REVIEWS.md`.
5. If `approve` or `approve_with_nits`: mark task `merged` in `TASKS.md`, merge
   branch, advance `STATE.json`.
6. Otherwise: Builder addresses every `Critical:` and `(required)` finding in
   new commits on the same branch. Set `current_round += 1`. Go to 1.

**Round budget.** If `current_round > 5`, escalate to human — the task is
either mis-specified or too large. Do not grind past round 5 silently.

**Context Pack is the skill.** A reasoning-blind reviewer with bad context
rubber-stamps. The only leverage you have is the pack.

## Phase 4: SHIP — per sprint

After every task in the sprint is `merged`:

1. Run sprint-level verify (integration suite, not just per-task tests).
2. Run `scripts/governance-check.sh` — must exit 0 (boundary rules, unresolved
   findings, orphan branches, stale STATE).
3. Update sprint `STATE.json` to `status: closed`.
4. Advance project `STATE.json` to `current_sprint: sprints-NNN+1`.
5. If this is the last sprint, follow `spec-driven-dev` v1 SHIP phase for
   rollout, feature flags, monitoring, and rollback.

## Governance — gap #6 made real

Boundary rules (e.g. "L2 may call L1 and L0, L0 must not call L2") must be
enforced by script, not prose. The skill ships two runners:

- `scripts/task-lint.sh` — validates task-file frontmatter, sizing, verify
  command presence. Run at sprint open and in CI.
- `scripts/governance-check.sh` — project-wide invariants: every merged task
  has an approved review, every sprint STATE is consistent, every
  `artifact-registry/rules/RULE-*.md` that is marked `enforcement: lint` has a
  matching lint rule file.

Add project-specific checks as the project grows. New rule discovered in
review? It goes through the artifact-registry.

## Artifact Registry — gap #7

When a reviewer finds a pattern that should apply to *all future tasks* (not
just this one), capture it:

1. Write `context/artifact-registry/rules/RULE-NNN-<slug>.md` from
   `templates/artifact-registry/RULE.md`.
2. Decide `enforcement`:
   - `doc` — humans follow it (weakest)
   - `review_checklist` — added to `templates/review/REVIEW.md`
   - `lint` — automated rule (eslint, custom script, ast-grep, etc.)
3. If `lint`, also land the lint rule in the same commit as the RULE file.
4. `governance-check.sh` verifies that every `enforcement: lint` rule has a
   concrete implementation pointer.

Rules that stay at `doc` for more than 2 sprints should graduate or be
deleted. Dormant rules rot.

## Orchestrator contract — gap #8

Any `STATE.json` file is the single source of truth for "what's next". An
orchestrator's turn looks like:

```
1. Read project STATE.json → current_sprint
2. Read sprint STATE.json → current_task, current_round, next_action
3. Dispatch:
   - next_action=build  → spawn Builder in worktree for current_task
   - next_action=review → construct Context Pack, spawn Reviewer
   - next_action=modify → Builder addresses unresolved findings
   - next_action=merge  → merge branch, advance STATE
   - next_action=close_sprint → run governance-check, advance project STATE
4. Exit. Next loop iteration re-reads STATE.
```

STATE.json schemas are in `templates/project/STATE.json` and
`templates/sprint/STATE.json`. Keep them small. Do not put history in them —
history lives in `TASKS.md` and `REVIEWS.md`.

## Red flags

- Any task with no verify command, or verify that just echoes "ok"
- Builder touching files outside the task's declared file list
- A review file that references `round1` only — real tasks take 2–4 rounds
- `current_round > 5` with no human in the loop
- `RULE.md` with `enforcement: lint` but no lint rule in the repo
- Two sprints open at once
- Merged task with no approved review file
- STATE.json last-modified older than the most recent commit on the branch

Any of these → `governance-check.sh` should fail. If it doesn't, add the check.

## Templates

- `templates/project/RFC.md` — project contract
- `templates/project/PLAN.md` — sprint decomposition
- `templates/project/STATE.json` — project-level orchestrator state
- `templates/sprint/SPRINT.md` — sprint goal + exit criteria
- `templates/sprint/TASKS.md` — task status table
- `templates/sprint/REVIEWS.md` — round log
- `templates/sprint/STATE.json` — sprint-level orchestrator state
- `templates/task/TASK.md` — one task spec
- `templates/review/REVIEW.md` — 5-axis review with Context Pack
- `templates/artifact-registry/RULE.md` — captured rule
- `scripts/task-lint.sh` — mechanical task gate
- `scripts/governance-check.sh` — project-wide invariant checker

## Relation to v1

v1's five-axis review, rationalization tables, and scope discipline are
unchanged and assumed. v2 wraps them in structure that survives multi-day,
multi-session execution. If a v2 project collapses back to one session with
one sprint and one task, it should read like v1 with extra files — that is
acceptable; the overhead is the insurance.
