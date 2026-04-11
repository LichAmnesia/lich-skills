# Review: [PR / Change Title]

> Reviewer: [name / agent]
> Change: [link to PR or commit range]
> Spec: [link to SPEC.md section this implements]
> Plan: [link to PLAN.md task this closes]
> Date: [YYYY-MM-DD]

## Context

- [ ] I understand what this change does
- [ ] I understand *why* it is being made
- [ ] I have read the relevant spec section
- [ ] I have read the relevant plan task(s)

Summary in my own words:
[One or two sentences.]

## Axis 1: Correctness

- [ ] Matches the spec's acceptance criteria
- [ ] Handles edge cases: null, empty, zero, negative, huge, unicode
- [ ] Handles error paths, not just the happy path
- [ ] No off-by-one, race condition, or state inconsistency
- [ ] Tests actually test behavior, not implementation details
- [ ] Tests would fail if the code were wrong (spot check one)

Findings:
- …

## Axis 2: Readability and Simplicity

- [ ] Names are descriptive and follow project conventions
- [ ] No `temp`, `data`, `result`, `foo` without context
- [ ] Control flow is straightforward (no deep nesting, no nested ternaries)
- [ ] Could this be done in fewer lines without losing clarity?
- [ ] Abstractions earn their complexity (no premature generalization)
- [ ] No dead code, no `// removed`, no `_unused` variables
- [ ] Comments explain *why*, not *what*

Findings:
- …

## Axis 3: Architecture

- [ ] Follows existing patterns, or introduces a new one with justification
- [ ] Clean module boundaries (no cross-layer leakage)
- [ ] Dependencies flow in the right direction (no cycles)
- [ ] No duplication that should be shared
- [ ] Appropriate level of abstraction (not over, not under)
- [ ] Change is scoped — no "while I'm here" refactoring mixed in

Findings:
- …

## Axis 4: Security

- [ ] No secrets in code, logs, or version control
- [ ] User input validated and sanitized at boundaries
- [ ] Auth and authorization checks in place where needed
- [ ] SQL is parameterized (no string concatenation)
- [ ] Output encoded to prevent XSS
- [ ] External data (APIs, files, user content) treated as untrusted
- [ ] New dependencies reviewed (license, maintenance, known CVEs)

Findings:
- …

## Axis 5: Performance

- [ ] No N+1 query pattern
- [ ] No unbounded loops or list fetches
- [ ] Pagination on list endpoints
- [ ] No sync operations that should be async
- [ ] No unnecessary re-renders / re-computations
- [ ] Indexes cover new query paths
- [ ] Bundle impact (if frontend) is acceptable

Findings:
- …

## Verification Story

How the author proved this works — not "I think so", but evidence.

- [ ] Full test suite run and green (paste or link output)
- [ ] Build and typecheck clean
- [ ] Manual smoke test (steps + result)
- [ ] Screenshots for any visual change
- [ ] Before/after numbers for any perf change

## Findings Summary

Label every finding so the author knows what is required vs optional.

| Severity | File:Line | Finding |
|---|---|---|
| **Critical:** | | |
| *(required)* | | |
| **Consider:** | | |
| **Nit:** | | |
| **FYI:** | | |

## Dead Code Check

- [ ] No orphaned files, functions, exports
- [ ] No feature flag branches left over after rollout
- [ ] If any dead code was found, it is listed below for the author to remove

Dead code found:
- …

## Change Description Check

- [ ] First line is imperative and informative ("Add task sharing API", not "Fix")
- [ ] Body explains *what* and *why*, not just diff
- [ ] Links to spec, plan, and any bug numbers
- [ ] Acknowledges known shortcomings

## Verdict

- [ ] **Approve** — ready to merge
- [ ] **Approve with nits** — merge after trivial fixes, no re-review needed
- [ ] **Request changes** — required issues listed above must be addressed
- [ ] **Reject** — fundamental problem, go back to Spec or Plan phase

Reviewer notes:
[...]
