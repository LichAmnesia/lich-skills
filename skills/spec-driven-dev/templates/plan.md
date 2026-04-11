# Plan: [Feature / Project Name]

> Derived from: [path to SPEC.md]
> Status: [draft | approved | in progress | done]
> Last updated: [YYYY-MM-DD]

## Overview

[One paragraph. What we are building, in the plan's own words. Should be
consistent with the spec's summary but written from the implementer's
perspective.]

## Architecture Decisions

Record the non-obvious decisions and *why*.

- **Decision:** [e.g. Store task history in a separate append-only table]
  **Rationale:** [Query patterns are read-heavy, retention is longer.]
- **Decision:** [...]
  **Rationale:** [...]

Non-decisions (things we intentionally chose *not* to do):

- Rejected: [e.g. Event sourcing]. Reason: [overkill for current scale].

## Dependency Graph

```
[schema changes]
        │
        ├─▶ [domain types]
        │         │
        │         ├─▶ [API endpoints]
        │         │         │
        │         │         └─▶ [client calls]
        │         │                   │
        │         │                   └─▶ [UI components]
        │         │
        │         └─▶ [validation]
        │
        └─▶ [seed / migration scripts]
```

Build bottom-up. Vertical slices, not horizontal layers.

## Task List

Every task has: description, acceptance criteria, verification, dependencies,
files, size.

### Phase 1: Foundation

- [ ] **Task 1: [short title]**
  - **Description:** [one paragraph]
  - **Acceptance:**
    - [ ] [specific, testable condition]
    - [ ] [specific, testable condition]
  - **Verify:**
    - `<test command>`
    - `<build command>`
    - Manual check: [...]
  - **Depends on:** None
  - **Files:** `src/...`, `tests/...`
  - **Size:** S

- [ ] **Task 2: [short title]**
  - **Description:**
  - **Acceptance:**
  - **Verify:**
  - **Depends on:** Task 1
  - **Files:**
  - **Size:** M

### Checkpoint: Foundation

- [ ] All tests pass
- [ ] Build clean
- [ ] Core flow works end-to-end (even if ugly)
- [ ] Review with human before continuing

### Phase 2: Core Features

- [ ] **Task 3: [short title]**
  - ...
- [ ] **Task 4: [short title]**
  - ...

### Checkpoint: Core

- [ ] Feature reachable by a real user in a real environment
- [ ] No regressions on existing flows

### Phase 3: Polish and Edges

- [ ] **Task 5: [short title]** — error states, empty states, loading
- [ ] **Task 6: [short title]** — accessibility, i18n
- [ ] **Task 7: [short title]** — docs and changelog

### Checkpoint: Ready for Review

- [ ] All spec success criteria met
- [ ] All tests green
- [ ] Code review requested

## Task Sizing Reference

| Size | Files | Scope |
|---|---|---|
| XS | 1 | Config or single rule change |
| S | 1–2 | One endpoint, one component |
| M | 3–5 | One vertical feature slice |
| L | 5–8 | Split if possible |
| XL | 8+ | **Too big. Break it down.** |

Break down further if:

- Cannot state acceptance in ≤3 bullets
- Touches two independent subsystems
- Title contains the word "and"

## Parallelization

- **Safe to parallelize:** [list tasks or slices]
- **Must be sequential:** [list chains]
- **Contract-first:** [tasks that need an agreed contract before splitting]

## Risks and Mitigations

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| [e.g. Migration locks table] | High | Low | Run in maintenance window, test on staging dump |
| | | | |

## Open Questions

- [ ] [Question for human]
- [ ] [Question for human]

## Sign-off

- [ ] Every task has acceptance + verify
- [ ] Tasks ordered by dependency
- [ ] No XL tasks remain
- [ ] Checkpoints between phases
- [ ] Human reviewed and approved
