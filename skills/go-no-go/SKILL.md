---
name: go-no-go
description: Use BEFORE any spec, plan, or code exists — the Stage 0 gate that decides whether a project should start at all. NO-GO is the default. GO requires passing five framework checks (Differentiation · Audience–Market Fit · Acquisition Channel · Capacity · 7-Factor Wedge), a memory check against your own prior attempts, and a 24-hour pattern-interrupt if enthusiasm-high is detected. Output is a public commitment artifact with pre-mortemed kill criteria (D14/D30/D60/D90 review gates). Triggered by "/go-no-go [project]", any "I want to build / start / take on X" intent, or before opening any new repo or signing any new contract. Pairs with spec-driven-dev (this is Stage 0, that is Stage 1).
---

# Go / No-Go — Stage 0

> **NO-GO is the default. GO requires evidence.**

Most AI coding skills help you build. This one helps you **not** build.

Half the cost of solo work is starting the wrong thing. Once a repo exists,
sunk cost and identity-protection make it hard to quit. So you grind 3–6
months before admitting the start itself was wrong.

`go-no-go` is the gate before any `/spec`, `/plan`, `/build`. It runs five
framework checks (configurable), a memory check against your own past
attempts, and a 24-hour cooldown if your enthusiasm is too high. The output
is a public commitment doc with pre-mortemed kill criteria. If anything
fails, the default is NO-GO.

It is a deliberately **stronger** instrument than a generic intent-extraction
interview: it stores memory, fails by default, requires structural overrides,
and produces a dated artifact you publish.

## When to Use

Run `/go-no-go` when:

- You catch yourself thinking "I should build X" / "I want to start Y" /
  "I should take on Z client"
- Before opening any new git repo
- Before signing any client contract or partnership
- Before any commitment with attention budget > 14 days
- Before invoking `/spec`, `/plan`, or `/build` on a **new** thing
- When you feel sudden enthusiasm — *especially* then

## When NOT to Use

- Continuing existing committed projects (use `/spec` directly)
- Tactical pivots within an already-confirmed project
- Pure information requests ("how does X work?")
- Daily journaling or routine work
- Reactive content (writing about a news event, not a project commitment)
- One-off tasks under ~4 hours

## How It Differs From Other Pre-Build Skills

| | Plain intent interview | `go-no-go` |
|---|---|---|
| Default outcome | Continue | **NO-GO** |
| Memory of past attempts | None | **Mandatory pre-flight search** |
| Framework checks | Generic restate | **5 fail-by-default gates** |
| Time gate | None | **24h pattern-interrupt** if enthusiasm-high |
| Output | Confirmed restate | **Public commitment doc** with kill criteria |
| Override semantics | "Yes/no" | **Structured override with named reason** |
| Lifecycle | One session | **D14/D30/D60/D90 review schedule** |
| Composability | Standalone | **Stage 0 of any SDLC** (pairs with spec-driven-dev) |

If your situation calls for a softer instrument, use a generic intent
interview. If you have a pattern of starting and not finishing, use this.

## Loading Constraints

- Needs a live, responsive user — **do not invoke in CI, scheduled runs,
  `/loop`, or autonomous loops**
- Needs read/write access to the configured memory store (default:
  `~/.go-no-go/journal.md`)
- Needs at least one prior journal entry OR an explicit "first run"
  acknowledgment from the user

## The Eight Steps

### Step 0: Pre-flight Memory Check (MANDATORY)

Before asking anything, search the configured memory store for prior similar
attempts.

```
PRE-FLIGHT:
- Topic: <extracted from user pitch>
- Searched: <memory store path>
- Found N prior similar attempts:
  - <date> <name> → <outcome>
  - <date> <name> → <outcome>
```

If `N ≥ 1`, state explicitly:

> "You attempted [similar X] in [date]. It ended because [reason from journal].
>  **What is structurally different this time?**"

Wait for an answer. Reject these answers as non-structural:

- "I'm older / wiser now"
- "I'll try harder this time"
- "I learned my lesson"
- "I have more discipline now"

Accept these as structural:

- "The market changed — specifically: [verifiable change]"
- "I have a new asset — specifically: [named asset]"
- "I have a partner now — specifically: [named partner with role]"
- "I'm not solo anymore — specifically: [team of N]"

If the answer is non-structural → **automatic NO-GO**. Document the
attempted override in the commitment doc so the user can see they tried.

### Step 1: Hypothesis with Confidence Number

Write one sentence describing what you think the user wants, with an honest
confidence number.

```
HYPOTHESIS: You want to <restated intent>, and you reached for <stated approach>
            because <conventional reason>.
CONFIDENCE: ~XX%
```

The number forces honesty. If you can't predict the user's reaction to the
next three questions you'd ask, lower the number.

### Step 2: One Question at a Time, Each with a Guess

Format:

```
Q: <focused question>
GUESS: <your hypothesis for the answer, with reasoning>
```

Wait for the user before asking the next. Why one-at-a-time, why guess
attached:

- Reacting to a wrong guess is faster than generating from scratch
- Batching encourages skim-answers
- Each guess commits you to a hypothesis you can be visibly wrong about

### Step 3: Listen for "want vs. should-want"

Watch for buzzword answers ("scalable", "modern", "robust", "clean") and
convention-talk ("the standard approach", "best practice"). The wildcard
question, used when you hear those:

> *"If you didn't have to justify this to anyone — not even your future self
>  on Twitter — what would you actually want?"*

That one question often surfaces more than the previous five.

### Step 4: The Five Mandatory Framework Checks

Run all five. **Any FAIL = automatic NO-GO** unless the user explicitly
overrides with a named structural reason (recorded in commitment doc).

The default checks are below. Users override or add to these via
`~/.go-no-go/config.yml` (see `templates/config.yml`).

#### Check 1 — Differentiation

> Can a competent operator clone 80% of this in 2 weeks?

- PASS condition: structural moat (proprietary asset / exclusive relationship
  / regulatory advantage / network effect / data accumulation)
- FAIL condition: effort-based ("I'll work harder") or taste-based ("my
  version will be better") moat only

#### Check 2 — Audience–Market Fit

> Who pays for this? Who follows your work?

- Estimate income/budget bracket for both
- PASS: within ~2–3× of each other
- FAIL: more than 3× apart

Demand strength does **not** compensate for audience–market mismatch.

#### Check 3 — Acquisition Channel

> Where do the FIRST 100 customers/users come from? Be specific.

- PASS: confirmed warm channel with named reach
- PASS: shipped track record on a specific platform that this audience reads
- PASS: named partner with confirmed introductions
- FAIL: "I'll post on social media" (without specific hook + 90-day cadence)
- FAIL: "Build it and they will come"
- FAIL: Marketplace as discovery (Gumroad / App Store / Etsy are checkout,
  not traffic)

#### Check 4 — Capacity

> Which capacity does this require? Do you have it free?

Capacities: creative · analytical · operational · social · executional.

- PASS: required capacity is in user's currently-available set
- FAIL: required capacity is currently saturated
- HARD LIMIT: max 2 parallel projects requiring the same capacity type

#### Check 5 — 7-Factor Wedge

For each factor, mark PASS or FAIL:

1. **asset_match** — leverages an existing asset you own?
2. **day_zero_warm_channel** — specific source for first 100 users?
3. **domain_authority_fit** — your reputation transfers to this domain?
4. **solo_executable** — you can ship V0 alone in < 30 days?
5. **moat_compounds** — does the moat strengthen with usage?
6. **cash_horizon** — break-even < 12 months OR funded by an independent
   stream?
7. **exit_optionality** — can you stop in 30 days with reusable salvage?

**Any 2 factors fail → AUTOMATIC NO-GO.**

### Step 5: Enthusiasm Detector → 24-Hour Pattern Interrupt

Scan the conversation for enthusiasm-high signals:

- "I'm so excited"
- "I just want to start"
- "let's go" / "let's do this"
- "I can already see how this works"
- "This is genius"
- User skipping or rushing through framework checks
- User rationalizing every NO

If detected:

```
PATTERN INTERRUPT TRIGGERED.

Enthusiasm signal: HIGH.
This is NOT a NO. This is a PAUSE.

Action:
- Draft the commitment doc now (Step 6).
- Save it to runs/<YYMMDD-HHMM>-go-no-go-<slug>/draft.md
- Tomorrow at this time, re-open it and answer:
  1. Re-read the draft. Still want to commit?
  2. What did you forget yesterday that you remember now?
  3. Which framework check feels weaker now than yesterday?

Only after that will Step 7 confirmation run.
```

This step is configurable but **on by default**. The cooldown duration is
`pattern_interrupt.cooldown_hours` in config (default 24).

### Step 6: Write the Commitment Doc

This is the public artifact. The full template lives in
`templates/commitment.md`. Required sections:

- Date, decision (GO / NO-GO / PAUSED)
- What I'm doing (one sentence, no buzzwords)
- Why I'm doing this (actual reason, not rationalized)
- Kill criteria — pre-mortemed BEFORE the start:
  - D14 metric + threshold
  - D30 metric + threshold
  - D60 metric + threshold
  - D90 hard-sunset review
- What I'm explicitly NOT doing (out of scope)
- 5 specific failure modes (pre-mortem)
- What I'll tell people who ask why I'm doing this
- What I'll tell people IF this fails (pre-written post-mortem narrative)
- Pre-flight check results (with reasons)
- Override section (if any check failed but going anyway)
- Public commitment checklist (when posted, where)
- Signature

### Step 7: Final Confirmation — Explicit Yes Only

The following are **not** confirmation:

- "Whatever you think is best" — that's delegation, not decision
- "Sounds good" — ambiguous; ask "anything you'd refine?"
- "Sure, let's go" — often polite exit
- Silence — not consent

Require: user reads the commitment doc in full and types "GO" with their own
hand. If 24-hour pattern interrupt was triggered, this step cannot run until
the cooldown has elapsed.

### Step 8: Handoff

- **If GO**: hand off to next stage. In this repo, that's `spec-driven-dev`
  (run `/spec` next). The commitment doc becomes the project's permanent
  root context.
- **If NO-GO**: append a journal entry to the memory store so future
  go-no-go sessions can find it. NO-GO reasoning is content gold: every
  thoughtful NO-GO is a story worth telling.
- **If PAUSED**: schedule the 24-hour follow-up. Do not advance to Step 7
  until then.

## Output Structure

```
runs/<YYMMDD-HHMM>-go-no-go-<slug>/
├── transcript.md           # full conversation
├── commitment.md           # the artifact (Step 6)
├── memory-check.md         # Step 0 search results
├── framework-checks.md     # 5 check details with reasons
└── decision.md             # GO / NO-GO / PAUSED with rationale
```

If GO and `public_commitment.enabled` is true, the commitment doc is also
posted to the configured public surface (Gist / GitHub repo / etc.).

## Configuration

The skill reads `~/.go-no-go/config.yml`. Schema and starter packs are in:

- `templates/config.yml` — full schema with all options documented
- `packs/solo-founder.yml` — default for solo product builders
- `packs/indie-dev.yml` — for technical builders without marketing focus
- `packs/content-creator.yml` — for newsletter / YouTube / Twitter operators

If no config exists, the skill prompts the user to pick a starter pack on
first run.

## Memory Store Modes

```yaml
memory:
  mode: file          # file | vault | git
  path: ~/.go-no-go/journal.md
```

- **file** — single markdown file, one entry per session, simplest
- **vault** — semantic search across a markdown knowledge vault. Works with
  [Obsidian](https://obsidian.md), [Logseq](https://logseq.com), or
  [Atomos](https://orangebot.ai/atomos) (a local-first Personal Research OS
  with built-in AI Q&A over your markdown vault — useful here because
  go-no-go's pre-flight memory check benefits from semantic search over your
  past commitment docs, retros, and journals)
- **git** — `git log --grep` across a "decisions" repo

`file` mode works with zero dependencies. `vault` and `git` modes are
opt-in for users with existing knowledge systems.

## Integration With Other Skills In This Repo

- `spec-driven-dev` — `go-no-go` is the stage **before** spec. If GO,
  the commitment doc becomes the Spec phase's input.
- `debug-hypothesis` — orthogonal. Debug-hypothesis applies to bugs in
  running code; go-no-go applies to whether code should be written at all.
- `subagent-brief` — orthogonal. Subagent-brief is token discipline within
  a delegation; go-no-go is project-level discipline before delegation.

## Common Rationalizations to Watch For

| Rationalization | Reality |
|---|---|
| "This time is different" | Identical to past failures' override pattern. Specify STRUCTURAL difference or NO-GO. |
| "I'll just spend a weekend on it" | Weekends become months. Set a hard 30-day abandon clock from go-no-go. |
| "I don't need the memory check, I remember" | If you remembered, you'd already have your structural-difference answer. Run the search. |
| "The wedge factors are too restrictive" | The defaults were calibrated from real failures. Restrictive = working as designed. |
| "I'm not that excited, no interrupt needed" | If you weren't excited, you wouldn't be considering this. Run the cooldown anyway. |
| "Override on Acquisition Channel, I'll figure it out" | Acquisition is the most-overridden check and the most-fatal one. No override on Acquisition. |
| "The upside is huge if it works" | Upside-only thinking is not go-no-go thinking. Both sides of the trade or NO-GO. |
| "Let me at least write the spec first" | Writing the spec creates sunk cost. Spec is post-decision; go-no-go is the decision. |
| "I'll just make this private" | Private commitments fail more often than public ones. Default is PUBLIC. |

## Red Flags Mid-Session

- User skipping pre-flight memory check ("I already know I haven't tried this") — force the search
- User offering overrides on more than one framework check — automatic NO-GO regardless
- User cannot write the "what I'll tell people if this fails" narrative — they haven't really pre-mortemed; send back to Step 6
- Confidence number stays > 70% through all five checks — you weren't adversarial enough; re-attack each check
- Pattern-interrupt 24h gets bypassed ("let's just commit now") — automatic NO-GO
- Fewer than three specific failure modes pre-mortemed — too lazy; send back
- Commitment doc has vague kill criteria ("if it's not working") — kill criteria must be DATE + METRIC + THRESHOLD
- User wants commitment doc PRIVATE only — defeats the point; either public or NO-GO

## Verification Checklist (run before issuing GO)

- [ ] Pre-flight memory check ran with a search of the configured store
- [ ] All five framework checks ran with explicit PASS/FAIL + reason
- [ ] Any FAILed checks have explicit override with a memorable structural reason
- [ ] If enthusiasm-high detected, 24h pattern-interrupt was triggered and elapsed
- [ ] Commitment doc has all required sections filled
- [ ] Kill criteria are SPECIFIC (date + metric + threshold)
- [ ] User typed "GO" explicitly (not autocomplete, not "yeah", not silence)
- [ ] D14 / D30 / D60 / D90 reviews scheduled
- [ ] If GO: commitment pushed to configured public surface
- [ ] If NO-GO: journal entry written to memory store
- [ ] Handoff to next stage identified (`spec-driven-dev` for GO)

## Why The Default Is NO-GO

Most decision tools default to "continue with adjustments." That bias compounds
the start-too-many problem. By making NO-GO the default and requiring
evidence to flip it, the skill aligns with the underlying truth: most ideas
should not be pursued, and the ones that should are the ones that can
withstand five specific checks.

After ten sessions, users internalize that **the gate is the work**. The
project may or may not happen after. Both outcomes are productive.
