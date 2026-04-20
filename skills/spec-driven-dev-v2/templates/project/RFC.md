# RFC-NNN: [Project Title]

> Status: [draft | approved | in progress | shipped | abandoned]
> Owner: [name]
> Created: [YYYY-MM-DD]
> Last updated: [YYYY-MM-DD]
> Supersedes: [RFC-MMM or "none"]

## TL;DR

[Two sentences. What we're building and why now. If you can't do this, the
scope isn't clear enough yet.]

## Problem

[What hurts today. Quantify the pain — numbers, dates, incidents, user quotes.
No hand-waving.]

## Goals

- [Specific, measurable outcome 1]
- [Specific, measurable outcome 2]

## Non-goals

- [Thing we are consciously not solving here, and why it would expand scope]
- [...]

## Success criteria (measurable)

These become acceptance checks at sprint close. No "make it better" — each
line must be falsifiable.

- [ ] [e.g. p95 API latency < 200ms on production traffic]
- [ ] [e.g. onboarding completion rate ≥ 60% on 7-day cohort]

## Assumptions

List assumptions that would change the design if wrong. The planner proceeds
as if these are true unless corrected before approval.

- ASSUMPTION: [...]
- ASSUMPTION: [...]

## Out of scope

[Adjacent work that could drift into this project. Name it so scope creep is
visible when it happens.]

## Boundaries

| Category | Rule |
|---|---|
| Always | [e.g. all new endpoints behind feature flag with owner + expiry] |
| Ask first | [e.g. schema changes to `users` table] |
| Never | [e.g. bypass auth middleware, commit secrets, cross-layer calls L0→L2] |

## Architecture sketch

[One paragraph or ASCII diagram. Name the major components and how they talk.
Decisions belong in PLAN.md — this is just orientation.]

## Risks

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| [...] | H/M/L | H/M/L | [...] |

## Open questions

- [ ] [Question that blocks approval]
- [ ] [Question that can be resolved during sprint 1]

## Rollback

[If this ships and must be undone, what does that look like? Data migrations?
Feature flag kill? This sets the risk budget.]

## Sign-off

- [ ] Success criteria are measurable
- [ ] Boundaries are explicit
- [ ] No blocking open questions
- [ ] Human approved
