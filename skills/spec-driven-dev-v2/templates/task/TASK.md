---
id: TK-NNN
slug: <kebab-slug>
size: S
depends_on: []
files:
  - src/...
  - tests/...
verify: "<executable shell command that exits non-zero on failure>"
rollback: "git revert <merge-sha> && <any data rollback>"
status: pending
---

# TK-NNN: [Task title — no "and"]

> Sprint: [sprints-NNN-<slug>]
> Worktree: `../wt-TK-NNN` (created when status → building)
> Branch: `tk-NNN-<slug>`

## Why

[One paragraph. What RFC/sprint goal does this task move forward? Cite the
line — e.g. "Closes SPRINT.md in-scope bullet 2."]

## What

[Concrete description of the change. Use code-level nouns — function names,
file paths, endpoint routes. Not "make the UI nicer".]

## Acceptance criteria

Every line must be a test or an observable fact.

- [ ] [e.g. `POST /api/tasks` returns 201 with the created task body]
- [ ] [e.g. Invalid title returns 400 with machine-readable error code `TITLE_REQUIRED`]
- [ ] [...]

## Files in scope

Must match the frontmatter `files:` list exactly. Any file not listed is
**out of scope** — touching it is a phase violation.

- `src/...`
- `tests/...`

## Verify

The command the Builder runs to prove done. The Reviewer re-runs it from the
Context Pack. No "looks good" acceptable.

```bash
<verify command — same as frontmatter `verify`>
```

Expected exit code: `0`.
Expected stdout contains: `<substring that proves the behavior>` (optional).

## Rollback

If this task is merged and needs to be undone:

1. `git revert <merge-sha>`
2. [data rollback if any — migration down, flag flip, cache invalidate]
3. [observable signal that rollback worked]

## Out of scope

Things a reviewer might flag that are **intentionally not done here**. List
them so the review doesn't loop on "missing".

- [e.g. Caching — deferred to TK-007]
- [e.g. Authz on this endpoint — TK-012]

## Mechanical gate (task-lint.sh must pass)

- [ ] `size` ∈ {XS, S, M, L}; XL forbidden
- [ ] `files` has ≤ 5 entries (L may have up to 8 with justification note)
- [ ] `verify` is a non-empty executable command
- [ ] `rollback` is a non-empty line
- [ ] Title does not contain " and "
- [ ] Acceptance has ≥ 1 checkbox
- [ ] `depends_on` references existing TK ids in this sprint
