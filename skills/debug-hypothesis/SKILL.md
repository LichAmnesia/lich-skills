---
name: debug-hypothesis
description: Use when debugging any non-trivial bug — wrong output, crash, flaky test, performance regression, or "it works locally but not in CI." Forces a scientific-method loop (Observe → Hypothesize → Experiment → Conclude) so the agent stops guessing and starts reasoning. Prevents the #1 AI debugging failure mode — bulldozing through a wrong idea instead of falsifying it.
---

# Hypothesis-Driven Debugging

A four-phase loop that turns debugging from "try random fixes and hope" into
a disciplined investigation. Each phase has a goal, hard rules, and a
rationalization table for the excuses an agent will invent to skip it.

The core principle: **you may not write a fix until you have evidence that
your hypothesis is correct.** Guessing is not debugging.

## When to Use

- A test fails and the cause is not immediately obvious
- The same bug has been "fixed" twice and came back
- The agent tried a fix that didn't work — stop it from trying another
- A crash or error message you haven't seen before
- Performance regression with no obvious culprit
- Behavior differs between environments (local vs CI, dev vs prod)
- The agent is stuck in a loop, applying the same wrong fix

## When NOT to Use

- Typos, missing imports, or syntax errors — just fix them
- Build failures with an obvious single-line cause
- Compiler/linter messages that tell you exactly what and where
- You already know the root cause and just need to write the fix

If the bug survived one fix attempt, switch to this skill immediately.

## The Debug Loop

```
  OBSERVE  ──▶  HYPOTHESIZE  ──▶  EXPERIMENT  ──▶  CONCLUDE
     │              │                  │               │
     ▼              ▼                  ▼               ▼
  Gather          List 3-5         One minimal       Root cause
  symptoms,       possible         test per          confirmed
  reproduce       causes +         hypothesis,       or loop
  reliably        evidence         max 5 lines       back
     │              │                  │               │
     └──────────────┴──────────────────┴───────────────┘
              write everything to DEBUG.md
```

Hard rules:

1. Everything gets written to `DEBUG.md`. Context compaction will eat your
   reasoning if it only lives in the conversation.
2. You may not write fix code during Observe, Hypothesize, or Experiment.
3. You may not skip Hypothesize. "I think I know what it is" is a hypothesis —
   write it down and test it like the others.
4. Each experiment changes at most 5 lines. If your experiment needs more,
   your hypothesis is too vague — split it.

## Phase 1: OBSERVE

**Goal.** Collect raw facts. Reproduce the bug. Separate what you *know*
from what you *assume*.

**Steps.**

1. Reproduce the bug. Get the exact error message, stack trace, or wrong output.
   If you cannot reproduce it, that is your first finding.
2. Find the minimal reproduction. Strip away unrelated code until the bug
   still appears.
3. Record the environment: OS, runtime version, dependencies, config.
4. Note what *does* work. The boundary between working and broken is
   where the bug lives.
5. Write all observations to `DEBUG.md` under `## Observations`.

**Exit criteria.**

- [ ] Bug reproduced (or documented as non-reproducible with conditions)
- [ ] Exact error message or wrong behavior recorded
- [ ] Minimal reproduction identified
- [ ] Observations written to `DEBUG.md`

**Common Rationalizations**

| Excuse | Reality |
|---|---|
| "I already know what's wrong" | Then write it as a hypothesis and prove it. If you're right, it takes 2 minutes. |
| "Let me just try this quick fix first" | That's how you end up 45 minutes deep with 6 failed attempts. |
| "The error message is clear enough" | Error messages describe symptoms, not causes. `NullPointerException` tells you what died, not why. |
| "I don't need to reproduce it, I can see the bug in the code" | Can you? Then why hasn't it been fixed yet? |

## Phase 2: HYPOTHESIZE

**Goal.** Generate 3-5 possible root causes. For each, list supporting
and conflicting evidence from Phase 1. Rank by likelihood.

**Steps.**

1. List 3-5 hypotheses. Not 1. Not "I think it's X." Three minimum.
   Think across categories:
   - Data: wrong input, missing field, type mismatch, encoding
   - Logic: wrong condition, off-by-one, race condition, wrong order
   - Environment: config, version, dependency, permissions
   - State: stale cache, leaked state, initialization order
2. For each hypothesis, write:
   - **Supports:** evidence from observations that backs this theory
   - **Conflicts:** evidence that argues against it
   - **Test:** the minimal experiment that would prove or disprove it
3. Mark the **ROOT HYPOTHESIS** — the one with supporting evidence and
   no conflicting evidence. If multiple qualify, pick the easiest to test.
4. Write everything to `DEBUG.md` under `## Hypotheses`.

**Example format in DEBUG.md:**

```markdown
## Hypotheses

### H1: Race condition in session middleware (ROOT HYPOTHESIS)
- Supports: only happens under concurrent requests, timing-dependent
- Conflicts: none yet
- Test: add mutex lock around session read, check if bug disappears

### H2: Stale cache returning expired token
- Supports: works after restart (cache cleared)
- Conflicts: cache TTL is 5min, bug appears within 30s
- Test: disable cache, reproduce

### H3: Wrong env variable in CI
- Supports: works locally, fails in CI
- Conflicts: env diff shows identical values
- Test: print actual runtime value in CI logs
```

**Exit criteria.**

- [ ] At least 3 hypotheses written
- [ ] Each has supporting/conflicting evidence
- [ ] Each has a specific, minimal test
- [ ] ROOT HYPOTHESIS identified
- [ ] All written to `DEBUG.md`

**Common Rationalizations**

| Excuse | Reality |
|---|---|
| "I only have one theory" | You have one *favorite* theory. Think harder. What if it's not that? |
| "Writing this down is slow" | Debugging without writing is slower. You'll forget hypothesis 2 after compaction eats it. |
| "The first hypothesis is obviously right" | Then proving it takes 2 minutes. If you skip proof, you'll spend 30 minutes when it turns out wrong. |
| "I don't have conflicting evidence" | That means you haven't looked hard enough, or it really is the root cause. Either way, test it. |

## Phase 3: EXPERIMENT

**Goal.** Test the ROOT HYPOTHESIS with the smallest possible change.
You are a scientist — you are trying to **falsify**, not confirm.

**Steps.**

1. Write the experiment before running it. What will you change? What
   result confirms the hypothesis? What result rejects it?
2. Make the change. **Maximum 5 lines.** If you need more, your hypothesis
   is too vague.
3. Run the reproduction from Phase 1.
4. Record the result in `DEBUG.md` under `## Experiments`.

**Experiment rules.**

- One variable at a time. Do not combine two fixes "to save time."
- Do not write production fix code. Write diagnostic code: log statements,
  assertions, simplified logic, hardcoded values.
- Revert the experiment after recording results. Keep the tree clean.
- If the experiment is inconclusive, that's a result — record it and
  test the next hypothesis.

**Exit criteria.**

- [ ] Experiment executed (one change, one variable)
- [ ] Result recorded: confirmed, rejected, or inconclusive
- [ ] Experimental code reverted
- [ ] Results written to `DEBUG.md`

**Common Rationalizations**

| Excuse | Reality |
|---|---|
| "Let me just fix it instead of testing" | Fixing without confirming the cause is how you ship a wrong fix that breaks something else. |
| "I'll test two things at once to save time" | When both change and the bug disappears, which one fixed it? Now you have to test again. |
| "5 lines isn't enough" | 5 lines is enough to add a log, an assertion, a hardcoded value, or a short-circuit. If it isn't, your hypothesis is "something is wrong somewhere" — not a hypothesis. |
| "I don't need to revert, the fix is basically the experiment" | The experiment is diagnostic. The fix is production code. They have different quality bars. |

## Phase 4: CONCLUDE

**Goal.** Confirm root cause, write the real fix, and add a regression test.

**Steps.**

1. If ROOT HYPOTHESIS confirmed:
   - Write the **root cause** in one sentence in `DEBUG.md`.
   - Now — and only now — write production fix code.
   - Add a regression test that fails without the fix and passes with it.
   - Commit fix and test together.
2. If ROOT HYPOTHESIS rejected:
   - Record the rejection and evidence in `DEBUG.md`.
   - Promote the next hypothesis to ROOT. Return to Phase 3.
   - If all hypotheses rejected, return to Phase 1 with new observations.
3. Update `DEBUG.md` with the final `## Root Cause` and `## Fix` sections.

**Exit criteria.**

- [ ] Root cause identified and written in one sentence
- [ ] Fix committed
- [ ] Regression test committed
- [ ] `DEBUG.md` complete with full investigation trail
- [ ] Original reproduction case now passes

**Common Rationalizations**

| Excuse | Reality |
|---|---|
| "I don't need a regression test, it's a simple fix" | Simple fixes for simple bugs don't need this skill. You're here because it wasn't simple. Add the test. |
| "The DEBUG.md is just for debugging, I'll delete it" | Keep it. Future-you debugging the same area will thank present-you. |
| "All hypotheses failed, I'm stuck" | Go back to Observe. You missed something. The bug exists, therefore a cause exists. |

## The Anti-Bulldozer Rule

The #1 failure mode of AI debugging: the agent forms a theory, writes 150
lines of "fix" code, it doesn't work, so it writes another 150 lines going
deeper into the same wrong theory.

**This skill exists to prevent that.** If you catch yourself or the agent:

- Writing more than 5 lines before confirming a hypothesis → STOP. Back to Phase 2.
- Trying the same approach a second time → STOP. The hypothesis is rejected. Next one.
- Ignoring conflicting evidence → STOP. Write it down. Re-rank hypotheses.
- Feeling "almost there" after 3 failed attempts → STOP. You are bulldozing.

Write it down. Test it. Prove it. Then fix it.
