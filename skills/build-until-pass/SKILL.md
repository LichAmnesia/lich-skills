---
name: build-until-pass
description: Use when a build, typecheck, lint, or test command is failing and you want the agent to drive it to green on its own — run the check, read the errors, apply the smallest fix, re-run, repeat until exit code 0. Stops the human from being the while-loop (run → read error → fix one line → run again) and stops the agent from bulldozing huge speculative rewrites between checks.
---

# Build Until Pass

A bounded self-correcting loop: run the project's check command, capture its
errors, apply the **smallest** diff that addresses the first failure, re-run,
and repeat until it exits 0 — or until a hard attempt cap is hit.

The core principle: **the check command is the judge, not you.** You do not
declare the build "basically fixed." Green is `exit code 0`. Anything else is
red, and red means another round.

This is the engineering-discipline counterpart to "run it and hope." The cap
exists so the agent backs off instead of burning tokens thrashing on an error
it cannot fix without human input.

## When to Use

- A build / compile / bundle command fails and the cause is mechanical
  (type errors, missing imports, signature mismatches, bundler config)
- `tsc`, `cargo build`, `go build`, `npm run build`, `vite build` exits non-zero
- A typecheck or lint gate is red and you want it green before committing
- A focused test suite is failing and each failure points at a clear fix
- CI went red on a build/typecheck step and you're reproducing locally
- You catch yourself copy-pasting errors back to the agent one at a time

## When NOT to Use

- You don't know the check command yet — find it first (see Phase 0)
- The failure is a genuine *logic* bug needing investigation, not a mechanical
  fix → use `debug-hypothesis` instead, then come back here to confirm green
- The fix requires a product/design decision only a human can make
- The "fix" would mean deleting tests, `// @ts-ignore`-ing real errors, or
  loosening types to silence the compiler → that's cheating the judge, not
  passing it (see Anti-rationalizations)
- The build passes already — there's nothing to loop on

## The Loop

```
            ┌─────────────────────────────────────────────┐
            │  attempt > MAX_ATTEMPTS (default 10)?        │
            │  → STOP, report what's left, ask the human   │
            └──────────────────────┬──────────────────────┘
                                   │ no
   RUN CHECK ──▶ green? ──yes──▶  DONE (exit 0, report rounds used)
       ▲             │
       │             │ no (red)
       │             ▼
       │      READ ERRORS  ──▶  FIX SMALLEST  ──▶  re-RUN
       │      first failure     minimal diff,        │
       │      only, verbatim    no refactor          │
       └──────────────────────────────────────────────┘
                    one round = one fix + one re-run
```

Hard rules:

1. **Green is `exit code 0` from the check command.** Not "looks fixed," not
   "the error I saw is gone." Run it and read the exit status.
2. **One round = one targeted fix + one re-run.** Do not fix five unrelated
   things, then run once. You won't know which fix helped or broke something.
3. **Minimal diff per round.** Touch only the lines the current error points
   at. No drive-by refactors, no reformatting, no renaming.
4. **Hard attempt cap (default 10).** When hit, STOP and hand back to the
   human. Do not raise your own cap to "just try a few more."
5. **Report each round.** One line: `round N/MAX — <errors remaining> — <what I changed>`.
6. **Never silence the judge.** Suppressing an error (`@ts-ignore`, `any`,
   deleting a test, `|| true`) is not a pass. See Anti-rationalizations.

## Phase 0: LOCK THE CHECK COMMAND

**Goal.** Know exactly what command defines "green" before you touch any code.

**Steps.**

1. Identify the check command. Look at, in order: the user's instruction, the
   project's CI config (`.github/workflows/*`), `package.json` scripts,
   `Makefile`, `justfile`, the build tool's convention.
2. If multiple are plausible (`build` vs `typecheck` vs `test`), pick the one
   the user named; if unstated, pick the narrowest one that reproduces the
   reported failure, and state your choice.
3. Run it **once, unmodified**, to capture the baseline failure and confirm it
   actually fails. A check that already passes means there's nothing to do.
4. Set `MAX_ATTEMPTS` (default 10 unless the user gave a number).

**Exit criteria.**

- [ ] Exact check command written down (copy-pasteable)
- [ ] Baseline run captured — confirmed non-zero exit
- [ ] `MAX_ATTEMPTS` set

**Common Rationalizations**

| Excuse | Reality |
|---|---|
| "I'll just run `npm run build`, it's always that" | It's `tsc -b` in half of repos and a custom script in the other half. Read `package.json` — 5 seconds saves a loop spent fixing the wrong thing. |
| "I don't need the baseline, I know it fails" | Then capturing it costs one run and proves the failure mode you're about to fix is the one that's actually there. |
| "I'll set the cap later" | No cap means no stop condition. Set it now or the loop has no floor. |

## Phase 1: RUN CHECK

**Goal.** Get the current ground truth: exit code + full error output.

**Steps.**

1. Run the locked check command. Do not modify flags between rounds — same
   command every round, or the judge moved.
2. Read the **exit code**. `0` → jump to Done. Non-zero → continue.
3. Capture the error output. If it's long, focus on the **first** error block —
   later errors are often downstream of the first and vanish once it's fixed.

**Exit criteria.**

- [ ] Check command run unmodified
- [ ] Exit code read explicitly (not inferred from log text)
- [ ] First failure identified verbatim (file:line + message)

## Phase 2: FIX SMALLEST

**Goal.** Apply the minimum change that resolves the first failure.

**Steps.**

1. Locate the first error's `file:line`. Read the surrounding code.
2. Apply the smallest correct fix: add the missing import, fix the type, match
   the signature, correct the path. Real fixes only — see the cheating list.
3. Change one logical thing. If the same root cause produces N identical errors
   across files (e.g. a renamed export), fixing the root and the N call sites is
   one logical change — that's allowed. Five *unrelated* fixes is not.
4. Do not touch anything the error didn't point at. Resist refactoring.

**Exit criteria.**

- [ ] Fix targets the first failure's root cause
- [ ] Diff is minimal — no unrelated edits, no reformatting
- [ ] No error was suppressed to fake a pass

**Common Rationalizations**

| Excuse | Reality |
|---|---|
| "`@ts-ignore` / `# type: ignore` / `any` makes the error go away" | The error going away isn't the goal — the code being correct is. Suppressing it ships the bug with a green check on top. That's worse than red. |
| "I'll delete the failing test, then it passes" | The test is the judge for behavior. Deleting it doesn't fix the build, it blinds it. If the test is genuinely wrong, say so to the human — don't silently remove it. |
| "Let me refactor this whole file while I'm in here" | Now your diff has the fix tangled with 80 lines of churn. When the next round goes red, you can't tell which change caused it. Fix the one line. |
| "I'll fix all five errors at once to save rounds" | If the build then breaks differently, you've lost the mapping from change to effect. One fix, one run — the loop is cheap, untangling regressions is not. |
| "Loosening the type silences it" | Loosening the type to pass a typecheck defeats the entire reason the typecheck exists. The judge is now rubber-stamping. |

## Phase 3: RE-RUN & GATE

**Goal.** Decide: done, another round, or stop and escalate.

**Steps.**

1. Re-run the check (back to Phase 1's command).
2. **Green (exit 0)?** → Done. Report total rounds used.
3. **Red, and attempt < MAX_ATTEMPTS?** → Report this round, loop to Phase 1.
4. **Red, and attempt == MAX_ATTEMPTS?** → STOP. Do not raise the cap.
5. **Error unchanged after your fix, or oscillating** (error A → fix → error B
   → fix → error A)? → STOP early. The loop is stuck; a human or
   `debug-hypothesis` is needed. Don't spend the remaining rounds thrashing.
6. **Progress check:** if the *count* of errors isn't trending down across
   rounds, treat it like step 5 — you're not converging.

**Report format (one line per round):**

```
round 3/10 — 4 errors left (was 7) — fixed missing `await` in db.ts:42
```

**Exit criteria.**

- [ ] Re-run executed with the unmodified command
- [ ] Exit code checked, not assumed
- [ ] Either green-and-done, or looped, or stopped-and-escalated — never silently continuing past the cap

**Common Rationalizations**

| Excuse | Reality |
|---|---|
| "9 rounds in, just let me do a couple more" | The cap is the stop condition. Hitting it means this isn't a mechanical fix — it needs a human decision or real investigation. More blind rounds burn tokens, not bugs. |
| "The error count went up but I'm close" | Going up is the opposite of converging. Stop and look at *why* your fixes create new errors — your model of the failure is wrong. |
| "It's the same error as round 2 but I'll try a different fix" | You're oscillating. Two different fixes for one persistent error means you don't understand the error. Switch to `debug-hypothesis`. |
| "I'll just `|| true` the command so it exits 0" | That's not passing the build, that's lying to it. Anyone who runs the real command sees red. |

## When the Loop Stops Red

Hitting the cap (or stopping early) is a **legitimate, expected outcome** — not
a failure of the skill. Report:

1. The exact command and its final exit code.
2. The remaining errors (verbatim first block).
3. What you tried each round and why it didn't converge.
4. Your best hypothesis for why it's stuck (missing dep, env mismatch, a real
   logic bug, an API change that needs a design call).

Then hand back. A human unblocking one root cause is faster than the agent
blindly trying fix #11.

## Verification

The skill was applied correctly when:

- [ ] The check command was locked and run unmodified every round
- [ ] Each round was one targeted fix + one re-run, with a one-line report
- [ ] No error was suppressed, no test deleted, no type loosened to fake green
- [ ] The loop ended in exactly one of: **green (exit 0)**, **cap reached**, or
      **stopped early for non-convergence** — with a final report either way
- [ ] If green: a final clean run of the command shows exit code 0
- [ ] If red: remaining errors + a hand-back hypothesis were reported

## The Anti-Thrash Rule

The two failure modes this skill guards against:

- **Human-as-while-loop** — you copy an error to the agent, it fixes one line,
  you copy the next error, forever. Automate the loop, cap it, walk away.
- **Agent-as-bulldozer** — the agent writes a 200-line speculative "fix"
  between runs, it doesn't work, so it writes another 200 lines. Minimal diff
  per round + the cap kill this.

Run the judge. Read the first error. Fix the one thing. Run again. Stop at the cap.
