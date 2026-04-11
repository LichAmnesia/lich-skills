# Spec: [Project or Feature Name]

> Filed by: [author / agent session]
> Status: [draft | approved | implemented | superseded]
> Last updated: [YYYY-MM-DD]

## One-line Summary

[One sentence. What and for whom. If you cannot say it in one sentence, you
do not understand it yet.]

## Objective

**What are we building?**
[A paragraph. Concrete. No marketing words.]

**Why are we building it?**
[The problem this solves. The user's pain. What breaks if we do not build this.]

**Who is it for?**
[The actual user. A role, a persona, a named team — not "users".]

**What does success look like?**
[The measurable end state. Numbers where possible.]

## Assumptions

List what you are assuming so the human can correct you *before* you write code.

- [ ] Assumption 1 (e.g. "Postgres, inferred from existing schema")
- [ ] Assumption 2
- [ ] Assumption 3

> Correct me now or I proceed with these.

## Success Criteria

Translate every fuzzy requirement into something testable.

| # | Criterion | How we measure | Target |
|---|---|---|---|
| 1 | [e.g. Dashboard loads fast] | LCP on 4G | < 2.5s |
| 2 | [e.g. Search returns relevant results] | Precision@10 on eval set | > 0.8 |
| 3 | | | |

## Non-Goals

What this spec explicitly does **not** cover. Just as important as the goals.

- Not in scope: [...]
- Not in scope: [...]
- Deferred to a future spec: [...]

## Users and User Stories

- As a [role], I want to [action], so that [outcome].
- As a [role], I want to [action], so that [outcome].

## Tech Stack

- Language: [e.g. TypeScript 5.x]
- Framework: [e.g. Next.js 15 App Router]
- Runtime: [e.g. Node 22, Bun 1.x]
- Database: [e.g. Postgres 16 via Prisma]
- Key libraries: [name + version + why]
- Hosting: [e.g. Vercel, Fly, self-hosted]

## Commands

Copy-paste ready, including flags.

```bash
# Install
[install command]

# Dev
[dev command]

# Build
[build command]

# Test
[test command]

# Lint / typecheck
[lint command]
[typecheck command]
```

## Project Structure

```
src/            → application source
src/components  → reusable UI
src/lib         → shared utilities
src/server      → server-only code
tests/          → unit tests, mirrors src/
e2e/            → end-to-end tests
docs/           → documentation
```

(Adjust to match the actual project.)

## Code Style

One short real example beats three paragraphs of description.

```ts
// Naming, formatting, error handling, imports — demonstrated:
export async function getTaskById(id: TaskId): Promise<Task | null> {
  const row = await db.tasks.findUnique({ where: { id } });
  return row ? toTask(row) : null;
}
```

Key conventions:

- [e.g. No default exports for components]
- [e.g. Errors thrown as typed subclasses of AppError]
- [e.g. Date handling via date-fns, never raw Date math]

## Testing Strategy

- Framework: [e.g. Vitest for unit, Playwright for e2e]
- Location: [e.g. co-located `*.test.ts`, e2e in `/e2e`]
- Coverage target: [e.g. 80% lines, 100% on `src/lib/money`]
- Levels: unit for logic, integration for DB boundaries, e2e for critical flows only.
- What counts as "critical flow": [list them]

## Boundaries

**Always do:**

- Run tests before each commit
- Follow existing naming conventions
- Validate all external input at the boundary

**Ask first:**

- Database schema changes
- Adding a new dependency
- Changing CI config
- Touching `src/payments/*`

**Never do:**

- Commit secrets or credentials
- Edit `vendor/` or generated files
- Delete or skip failing tests without approval
- Rewrite unrelated files "while I'm here"

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| [e.g. N+1 on task list] | Medium | High | Add eager loading in query |
| | | | |

## Open Questions

Anything unresolved. Do **not** guess answers. Flag them and ask.

- [ ] Question 1
- [ ] Question 2

## References

- Linked ADRs: [...]
- Related specs: [...]
- Design doc / Figma / ticket: [...]

---

## Sign-off

- [ ] Author has written this spec
- [ ] Assumptions confirmed with requester
- [ ] Success criteria are measurable
- [ ] Boundaries agreed
- [ ] Open questions resolved or explicitly deferred
- [ ] Human reviewed and approved
