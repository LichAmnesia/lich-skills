---
task: TK-NNN
round: N
reviewer: critic-subagent
date: YYYY-MM-DD
verdict: pending   # pending | approve | approve_with_nits | request_changes | reject
critical_count: 0
required_count: 0
---

# Review: TK-NNN round N

> Task: [tasks/TK-NNN-<slug>.md](../tasks/TK-NNN-<slug>.md)
> Branch: `tk-NNN-<slug>`
> Commit range: `<base-sha>..<head-sha>`

---

## Part A — Context Pack (filled by Builder/Orchestrator BEFORE reviewer spawns)

**This is the only input the reviewer receives.** If a section is empty, the
reviewer will miss it — a rubber-stamp. Treat the pack as a first-class
artifact: committed, diffable, auditable.

### A.1 Task spec (verbatim)

Paste the TK file body here, or reference it if the reviewer has file access:

```
<contents of tasks/TK-NNN-<slug>.md>
```

### A.2 Anchors from RFC / SPRINT

- RFC §[section] — [exact sentence this task implements]
- SPRINT.md — in-scope bullet [N]

### A.3 Declared file set

Must match TK frontmatter `files:`. If `git diff --name-only` shows files
outside this list, the review is **Critical: out-of-scope change** before
any other axis is evaluated.

- src/...
- tests/...

### A.4 Diff (scoped to declared files)

```bash
# reviewer should re-run this to verify
git diff <base-sha>..<head-sha> -- <declared files>
```

Paste output (or a summary + stats) here:

```
<diff output>
```

### A.5 Commit trail

```
<git log --oneline base..head>
```

### A.6 Verify output (actual, not claimed)

```bash
$ <verify command from TK frontmatter>
<actual stdout/stderr>
# exit code: 0
```

### A.7 Governance / lint output

```bash
$ scripts/task-lint.sh tasks/TK-NNN-<slug>.md
<output>

$ scripts/governance-check.sh --scope=task --id=TK-NNN
<output>

$ <project-specific lint, e.g. eslint, ast-grep>
<output>
```

### A.8 Prior rounds — unresolved findings

If round > 1, list every `Critical:` or required finding from round N-1 that
was marked `[unresolved]` or new. This is what the reviewer should focus on.

- [ ] [RV-NNN-round(N-1)] Critical: <finding>
- [ ] [RV-NNN-round(N-1)] Required: <finding>

### A.9 Active artifact-registry rules

Rules with `enforcement: review_checklist` that apply here. The reviewer MUST
add each to their checklist below.

- [RULE-001-layering](../../../../artifact-registry/rules/RULE-001-layering.md)
- [...]

---

## Part B — Five-axis review (reviewer fills this)

### Axis 1: Correctness

- [ ] Matches every acceptance checkbox in the TK file
- [ ] Verify command passes, exit 0
- [ ] Edge cases: null, empty, zero, negative, large, unicode, concurrent
- [ ] Error paths covered, not only happy path
- [ ] Tests assert behavior, not implementation
- [ ] Spot-check: would one test fail if the code were wrong?

Findings:
- …

### Axis 2: Readability & simplicity

- [ ] Names descriptive, no `temp`/`data`/`foo`
- [ ] Control flow flat, no deep nesting / nested ternaries
- [ ] No dead code, no `// removed`, no unused `_vars`
- [ ] Abstractions justified by ≥ 2 callers
- [ ] Comments explain *why*, not *what*

Findings:
- …

### Axis 3: Architecture

- [ ] Stays within declared file set (A.3)
- [ ] Follows project layering (see A.9 rules)
- [ ] Dependency direction correct, no cycles
- [ ] No cross-layer leakage
- [ ] No "while I'm here" refactoring

Findings:
- …

### Axis 4: Security

- [ ] Input validated at boundary
- [ ] No secrets in code or logs
- [ ] Auth/authz checks where needed
- [ ] SQL parameterized
- [ ] External data treated as untrusted

Findings:
- …

### Axis 5: Performance

- [ ] No N+1
- [ ] No unbounded loops / list fetches
- [ ] Pagination where appropriate
- [ ] Async where required
- [ ] Indexes cover new query paths

Findings:
- …

### Registry rules applied (from A.9)

For every rule cited in A.9:

- [ ] RULE-NNN-<slug>: [pass | fail | n/a] — note

---

## Part C — Findings table

Severity labels: `Critical:` (blocks merge), *(required)*, `Consider:`, `Nit:`, `FYI:`.

| Severity | File:Line | Finding | Status |
|---|---|---|---|
| **Critical:** | | | [unresolved] |
| *(required)* | | | [unresolved] |
| **Consider:** | | | [unresolved] |
| **Nit:** | | | — |
| **FYI:** | | | — |

After the next round, the Builder appends `[resolved in round N+1 by <sha>]`
or leaves `[unresolved]`. `governance-check.sh` will not let a task be merged
with any `[unresolved] Critical:` or `[unresolved] (required)`.

---

## Part D — Verdict

- [ ] **approve** — all axes clean, no Critical, no required
- [ ] **approve_with_nits** — only Nits remain, merge after trivial fixes, no re-review needed
- [ ] **request_changes** — ≥ 1 Critical or required, new round needed
- [ ] **reject** — fundamental problem, return to task spec or sprint plan

Reviewer notes:
[...]

---

## Part E — Rule candidates

If you noticed a pattern that should apply beyond this task, propose a rule
for the artifact registry. The Planner decides whether to promote it.

- Candidate: [one-line rule]
  - Suggested enforcement: doc / review_checklist / lint
  - Rationale: [...]
