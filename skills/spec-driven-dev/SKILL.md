---
name: spec-driven-dev
description: Use when starting any non-trivial feature, refactor, or new project that will touch more than one file. Drives an AI coding agent through a gated Spec → Plan → Build → Test → Review → Ship lifecycle so work is specified before it is built, verified before it is reviewed, and reviewed before it ships.
---

# Spec-Driven Development

A gated, six-phase workflow for shipping real software with an AI coding
agent. Each phase has a goal, exit criteria, and a rationalization table for
the excuses an agent will invent to skip it. Do not advance until the current
gate is closed.

## When to Use

- Starting a new project, service, or significant feature
- Requirements arrive as a paragraph, screenshot, or vague idea
- The change touches more than one file or subsystem
- You are about to make an architectural decision
- An agent is about to write more than ~100 lines without a plan
- Picking up half-finished work from another session

## When NOT to Use

- One-line typo or copy fix
- Renaming a single local variable
- Changes fully scoped by a one-line request where "done" is unambiguous
- Pure dependency bumps with no behavior change
- Throwaway spikes clearly marked as experiments and never merged

If unsure, do the spec phase anyway. A 10-minute spec is cheap insurance.

## The Gated Workflow

```
  SPEC  ──▶  PLAN  ──▶  BUILD  ──▶  TEST  ──▶  REVIEW  ──▶  SHIP
   │          │          │          │          │           │
   ▼          ▼          ▼          ▼          ▼           ▼
 What &     Tasks &    Thin       Prove it   Five-axis   Deploy,
  why       order      slices     works      quality     observe,
                                   by test    gate       roll back
   │          │          │          │          │           │
   └──────────┴──────────┴──────────┴──────────┴───────────┘
            human or reviewer approves each gate
```

Rules of the gate:

1. You may loop backward (Test reveals a broken spec — return to Spec).
2. You may not skip forward. No building without a plan. No shipping without review.
3. Each gate produces a named artifact committed to the repo: `SPEC.md`,
   `PLAN.md`, code + tests, a review note / PR description, a launch + rollback note.

## Phase 1: SPEC

**Goal.** Turn a vague request into a written contract that answers *what*,
*why*, *for whom*, and *how we know it is done*. Surface assumptions before
they become bugs.

**Inputs.** User request, existing codebase, any prior specs, constraints.

**Steps.**

1. Restate the request in one sentence. Confirm with the human.
2. List assumptions explicitly. Example: `ASSUMPTIONS: web app, Postgres,
   session cookies. Correct me or I proceed.`
3. Reframe vague requirements as measurable success criteria. "Make it fast"
   becomes "dashboard LCP < 2.5s on 4G, initial data < 500ms".
4. Write the spec using `templates/spec.md` and save it in the repo.
5. Define Always / Ask First / Never boundaries.
6. Log open questions. Do not guess answers.

**Exit criteria.**

- [ ] Spec file saved in the repository
- [ ] Human has read and approved it
- [ ] Success criteria are specific and testable
- [ ] Boundaries are explicit
- [ ] No unanswered blocking questions

**Common Rationalizations**

| Excuse | Reality |
|---|---|
| "It's obvious what to build" | If it were, two engineers would write the same code. They won't. |
| "I'll write the spec after the code works" | That's documentation, not specification. It can no longer change the design. |
| "The user told me what they want" | Users describe symptoms, not contracts. Extract the contract. |
| "Requirements will change anyway" | That's exactly why you write them down — so the change is visible. |

## Phase 2: PLAN

**Goal.** Convert the spec into an ordered list of small, verifiable tasks
with an explicit dependency graph. No code is written in this phase.

**Inputs.** Approved spec, relevant source files, existing conventions.

**Steps.**

1. Enter read-only mode. Read the spec and the code it will touch.
2. Draw the dependency graph: what must exist before what.
3. Slice vertically. Thin end-to-end slices beat horizontal layers (schema →
   all APIs → all UI is the wrong shape).
4. Write tasks using `templates/plan.md`. Each task fits one focused session
   and touches ~5 files or fewer.
5. Insert verification checkpoints between task groups.
6. Call out risks and parallelization coordination (e.g. agree an API contract
   before splitting frontend/backend).

**Task sizing.**

| Size | Files | Example |
|---|---|---|
| XS | 1 | Add a validation rule |
| S  | 1–2 | One endpoint, one component |
| M  | 3–5 | One vertical feature slice |
| L  | 5–8 | Multi-component feature (split if possible) |
| XL | 8+ | **Too big. Break it down.** |

**Exit criteria.**

- [ ] Plan file saved in the repository
- [ ] Every task has acceptance criteria and a verify step
- [ ] Dependencies are ordered correctly
- [ ] No task is XL
- [ ] Checkpoints exist between phases
- [ ] Human approved the plan

**Common Rationalizations**

| Excuse | Reality |
|---|---|
| "I'll figure it out as I go" | That's how tangled diffs are born. Ten minutes planning saves hours untangling. |
| "Planning is overhead" | Planning *is* the work. Implementation without a plan is just typing. |
| "I can hold it in my head" | Context windows are finite. Compaction will eat it. |

## Phase 3: BUILD

**Goal.** Implement the plan in thin, compilable, revertible increments.
Every increment leaves the tree green.

**Inputs.** Approved plan, the current task.

**The increment cycle:** `implement → test → verify → commit → next slice`

**Rules.**

0. **Simplicity first.** What is the simplest thing that could work? Three
   similar lines beat a premature abstraction. Do not generalize before the
   third use case demands it.
1. **Scope discipline.** Touch only what the task requires. Note unrelated
   issues; do not fix them. No "while I'm here" refactors.
2. **One thing per commit.** Feature, refactor, and config change are three
   commits, not one.
3. **Always compilable.** Build and existing tests must pass after every slice.
4. **Feature flags for WIP.** Merge behind a flag if users should not see it yet.
5. **Rollback-friendly.** Additive > destructive. Each increment revertable alone.

**Exit criteria for each increment.**

- [ ] Does one thing, completely
- [ ] Build passes
- [ ] Lint and type checks pass
- [ ] Existing tests still pass
- [ ] Committed with a descriptive, imperative message

**Common Rationalizations**

| Excuse | Reality |
|---|---|
| "Faster to do it all at once" | It *feels* faster until something breaks in 500 changed lines. |
| "Too small to commit separately" | Small commits are free. Large commits hide bugs. |
| "Let me just quickly add this too" | Scope creep wearing a disguise. |
| "This refactor is small enough to include" | Mixing refactor with feature makes both harder to review. |

## Phase 4: TEST

**Goal.** Prove the code works with tests that will survive refactoring.
"Seems to work" is not done.

**Inputs.** Built code, spec's success criteria, bug reports (if any).

**Steps.**

1. New behavior: write the test **before** the code (RED → GREEN → REFACTOR).
2. Bug fixes: **Prove-It pattern.** Write a failing test that reproduces the
   bug. Only then fix it. The test becomes the regression guard.
3. Follow the pyramid: ~80% unit, ~15% integration, ~5% end-to-end.
4. Test **state, not interactions.** Assert on outcomes, not on which private
   methods were called.
5. Prefer real > fakes > stubs > mocks. Mock only at boundaries you cannot
   control (external APIs, clocks, randomness).
6. Name tests like a spec: `it('sets completedAt when task is completed')`.
7. Browser work: verify in an actual browser (DOM, console, network,
   screenshots). Unit tests alone do not prove a page renders.

**Exit criteria.**

- [ ] Every behavior in the spec has a test
- [ ] Bug fixes include a reproduction test that failed before the fix
- [ ] Full suite green: `<test command>`
- [ ] No skipped or disabled tests
- [ ] Coverage did not regress
- [ ] No flaky tests introduced

**Common Rationalizations**

| Excuse | Reality |
|---|---|
| "I'll write tests after it works" | You won't. And post-hoc tests test implementation, not behavior. |
| "I tested it manually" | Manual testing does not persist. Tomorrow's change will silently break it. |
| "Tests slow me down" | They slow you now; they speed you up every time you change this code. |
| "All tests pass" (unverified) | "Passes" without output is a claim, not a fact. Run them. |

## Phase 5: REVIEW

**Goal.** A five-axis quality gate. Nothing merges without it — including
code you wrote yourself.

**Inputs.** Built, tested code. The spec. The plan.

**The five axes.**

1. **Correctness** — matches spec, handles edges and errors, tests test the right thing.
2. **Readability & simplicity** — clear names, clean flow, no cleverness, no
   dead code, abstractions earn their complexity.
3. **Architecture** — fits existing patterns, clean boundaries, correct
   dependency direction, right level of abstraction.
4. **Security** — input validated, secrets out of code, auth checked, queries
   parameterized, external data treated as untrusted.
5. **Performance** — no N+1, no unbounded loops, pagination on list endpoints,
   async where required.

**Findings must carry severity.** Label every comment so the author knows
what is required vs optional:

| Prefix | Meaning |
|---|---|
| **Critical:** | Blocks merge — security, data loss, correctness |
| *(no prefix)* | Required before merge |
| **Consider:** / **Optional:** | Suggestion |
| **Nit:** | Style or formatting preference |
| **FYI:** | Informational only |

**Approval standard.** Approve when the change *improves overall code health*,
even if not how you would have written it. Do not block on preference. Do not
rubber-stamp either. Use `templates/review.md` as the checklist.

**Exit criteria.**

- [ ] All five axes evaluated
- [ ] Every Critical issue resolved
- [ ] Every required issue resolved or explicitly deferred with a filed bug
- [ ] Tests and build green on the final revision
- [ ] Change description stands alone (first line is imperative and informative)

**Common Rationalizations**

| Excuse | Reality |
|---|---|
| "It works, good enough" | Working + unreadable + insecure = debt that compounds. |
| "Tests pass, therefore good" | Tests do not catch architecture or security. Review does. |
| "AI-generated, probably fine" | AI output is confident *and* plausibly wrong. Scrutinize more, not less. |
| "We'll clean it up later" | Later never comes. Clean up before merge or file a tracked bug. |

## Phase 6: SHIP

**Goal.** Deploy safely. Every launch must be reversible, observable, and
incremental.

**Inputs.** Reviewed, merged code. A rollback plan. A monitoring plan.

**Steps.**

1. Run the pre-launch checklist from `templates/ship.md` (code quality,
   security, performance, accessibility, infra, docs).
2. Put user-visible behavior behind a feature flag with an owner and expiry.
3. Stage the rollout: `staging → prod (flag off) → team → 5% → 25% → 50% → 100%`
4. Document rollback triggers **before** deploying: error rate > 2× baseline,
   p95 latency > 50% above baseline, new client JS errors > 0.1% of sessions,
   any data integrity or security issue.
5. Watch dashboards for the first hour: error rate, latency, business metric,
   logs flowing, health endpoint 200.
6. Clean up the feature flag within two weeks of full rollout.

**Exit criteria.**

- [ ] Pre-launch checklist green
- [ ] Rollback plan written and linked from the PR/launch note
- [ ] Feature flag configured, with owner and expiration
- [ ] Monitoring dashboards exist and show data
- [ ] Team knows the deploy is happening
- [ ] First-hour post-deploy verification completed

**Common Rationalizations**

| Excuse | Reality |
|---|---|
| "Works in staging, will work in prod" | Prod has different data, traffic, and edge cases. Monitor after deploy. |
| "We don't need a flag for this" | Every feature benefits from a kill switch. Even simple ones break things. |
| "We'll add monitoring later" | You cannot debug what you cannot see. Add it before launch. |
| "Rolling back is admitting failure" | Rolling back is responsible engineering. Shipping broken is the failure. |
| "It's Friday afternoon, let's ship it" | No. |

---

## Red Flags: Signs the Agent Is Skipping Phases

- Code written before any spec exists
- `PLAN.md` tasks that say "implement the feature" and nothing else
- Touching files outside the current task "while I'm here"
- A single commit mixing schema, UI, and config changes
- "Tests pass" claimed with no output pasted
- More than 100 lines added with no test run in between
- Review comments with no severity labels
- A deploy with no rollback plan
- A feature flag with no owner and no expiry

If you see any of these, return to the most recent unpassed gate and redo it.

## Verification Checklist

Before declaring the workflow done:

- [ ] Spec committed, approved, still accurate
- [ ] Plan committed, every task checked off
- [ ] Every task has tests proving its behavior
- [ ] Five-axis review completed, all Critical resolved
- [ ] Pre-launch checklist green
- [ ] Rollback plan written and understood
- [ ] Feature flag (if any) has an owner and a kill date
- [ ] Monitoring live and showing traffic from new code
- [ ] First-hour post-deploy verification done

## Templates

- `templates/spec.md` — write this in Phase 1
- `templates/plan.md` — write this in Phase 2
- `templates/review.md` — use this in Phase 5
- `templates/ship.md` — use this in Phase 6

## Related Skills

This workflow is intentionally coarse. Reach for focused skills for depth on
individual phases (planning, TDD, code review, shipping). This skill is the
spine; others are the organs.
