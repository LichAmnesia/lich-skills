# Sprint NNN: [Sprint Slug]

> Project: [projects-NNN-<slug>]
> Status: [draft | active | closed | abandoned]
> Opened: [YYYY-MM-DD]
> Closed: [YYYY-MM-DD or —]

## Goal

[One sentence. What closes at the end of this sprint. If you can't write it in
one sentence, the sprint is not scoped.]

## Why this sprint exists

[Link back to RFC section(s). Which success criterion does this sprint move
toward? "Closes RFC §Goals bullet 2."]

## In scope

- [concrete deliverable 1]
- [concrete deliverable 2]

## Out of scope (for this sprint)

- [adjacent thing that will land in a later sprint]
- [...]

## Task list

Tasks live as individual files in `tasks/`. This section is the overview —
`TASKS.md` is the status tracker.

| # | File | Title | Size | Depends on |
|---|------|-------|------|------------|
| 1 | [TK-001-...](tasks/TK-001-....md) | [title] | S | — |
| 2 | [TK-002-...](tasks/TK-002-....md) | [title] | M | TK-001 |

## Exit criteria

Every line must be mechanically checkable.

- [ ] All tasks merged (approved review for each)
- [ ] `scripts/governance-check.sh` exits 0
- [ ] Sprint-level verify: `<integration test command>` exits 0
- [ ] Demo ready: [what a human would see, or "flag-gated route X renders"]
- [ ] No XL tasks remain
- [ ] No open Critical: findings across any `reviews/RV-*.md`

## Deferred decisions

Things explicitly pushed to later sprints, recorded so they aren't lost.

- [decision] → [target sprint]

## Sign-off

- [ ] Goal is one sentence
- [ ] Every task file exists and passes `task-lint.sh`
- [ ] Exit criteria are mechanically checkable
- [ ] Human approved before first TK opens
