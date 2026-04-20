---
id: RULE-NNN
slug: <kebab-slug>
status: proposed    # proposed | active | deprecated | retired
enforcement: doc    # doc | review_checklist | lint
origin: RV-NNN-roundN   # which review surfaced this
lint_rule: ""       # path to the lint rule file if enforcement: lint
created: YYYY-MM-DD
last_updated: YYYY-MM-DD
---

# RULE-NNN: [One-line rule]

## Statement

[The rule as one assertion. No hedging, no "usually". If you can't state it
unconditionally, it's not a rule — it's a guideline.]

Example:
> L0 modules (`src/core/**`) MUST NOT import from L2 modules (`src/io/**`).

## Rationale

[Why this rule exists. Cite the incident or review that surfaced it. A rule
without a story rots — people can't judge edge cases.]

- Origin: `reviews/RV-NNN-roundN.md` — [one-line summary of finding]
- Reason: [constraint this protects: cycles, test isolation, blast radius, etc.]

## Examples

### Allowed

```<lang>
// src/io/http.ts
import { parseTask } from '../core/task';  // L2 → L0, fine
```

### Forbidden

```<lang>
// src/core/task.ts
import { fetchTask } from '../io/http';  // L0 → L2, BAD
```

## Enforcement

Set `enforcement:` in frontmatter to one of:

- **doc** — documented only, no automation. Allowed ≤ 2 sprints; then graduate or retire.
- **review_checklist** — added to `templates/review/REVIEW.md` §A.9 for applicable tasks.
  Reviewer must explicitly pass/fail/n-a this rule.
- **lint** — automated. MUST land alongside a concrete rule file, referenced by `lint_rule:`.
  `governance-check.sh` verifies the pointer resolves.

### Lint rule pointer (if `enforcement: lint`)

Path: `<repo-relative path>` — e.g. `.eslintrc.js :: no-restricted-imports` or
`scripts/lint/no-l0-to-l2.mjs`.

Test that proves the rule works:
```bash
<command that shows the rule catches a violation>
```

## Exceptions

Legitimate exceptions must be enumerated here, not scattered in code.

- [none] — or list specific files/paths with justification

## Graduation history

| Date | Status | Reason |
|---|---|---|
| YYYY-MM-DD | proposed | Captured from RV-NNN-roundN |
| YYYY-MM-DD | active (doc) | Approved by planner |
| YYYY-MM-DD | active (lint) | Implemented in `<path>`, verified with `<test cmd>` |

## Retirement criteria

[When does this rule no longer apply? E.g. "once L2 is renamed to `server/`
the paths change." A rule with no retirement criterion is forever — make sure
that's really what you want.]
