# go-no-go

> **Stage 0 of any commitment. NO-GO is the default. GO requires evidence.**

A gate skill that runs *before* `/spec`, `/plan`, or `/build`. It tests
whether a new project should start at all, using a memory check against
your prior attempts, five framework gates, a 24-hour pattern-interrupt for
high-enthusiasm signals, and a public commitment artifact with
pre-mortemed kill criteria.

This is **not** a generic intent interview. It is a deliberately stronger
instrument with structured fail conditions, persistent memory, time gates,
and dated review schedules.

## Why it exists

Half the cost of solo work is starting the wrong thing. Once a repo exists,
sunk cost and identity-protection make it hard to quit — so you grind
3–6 months before admitting the start itself was wrong.

`go-no-go` kills the bad starts before they become starts.

## When to use

- Before opening any new git repo
- Before signing any client contract or partnership
- Before any commitment with attention budget > 14 days
- Before invoking `/spec`, `/plan`, or `/build` on a **new** thing
- When you feel sudden enthusiasm — especially then

## When NOT to use

- Continuing existing committed projects (use `/spec` directly)
- Tactical pivots within a confirmed project
- One-off tasks under ~4 hours
- Pure information requests
- Daily journaling or routine work

## Quick start

```bash
# Install the lich-skills marketplace into Claude Code
/plugin marketplace add LichAmnesia/lich-skills
/plugin install lich-skills@lich-skills

# Or via skills.sh installer
npx skills@latest add LichAmnesia/lich-skills

# Then in Claude Code:
/go-no-go I want to build an AI Voice generator for podcasters
```

## First-run config

On first run, `go-no-go` prompts you to pick a starter pack:

- `solo-founder` — Differentiation · Audience–Market Fit · Acquisition Channel · Capacity · 7-Factor Wedge
- `indie-dev` — Maintenance Burden · Skills Match · Side-Project Tax · Differentiation · 30-Day Demo Test
- `content-creator` — Niche Resonance · Cadence Sustainability · Audience Permission · Differentiation · Compounding Asset
- `custom` — define your own checks in `~/.go-no-go/config.yml`

You can fork any pack: copy `packs/<name>.yml` into `~/.go-no-go/config.yml`
and edit.

## How it differs from a generic intent interview

| | Plain intent interview | `go-no-go` |
|---|---|---|
| Default outcome | Continue | **NO-GO** |
| Memory of past attempts | None | **Mandatory pre-flight search** |
| Framework checks | Generic restate | **5 fail-by-default gates** |
| Time gate | None | **24h pattern-interrupt** if enthusiasm-high |
| Output | Confirmed restate | **Public commitment doc** with kill criteria |
| Override semantics | "Yes/no" | **Structured override with named reason** |
| Lifecycle | One session | **D14 / D30 / D60 / D90 review schedule** |
| Composability | Standalone | **Stage 0 of any SDLC** (pairs with `spec-driven-dev`) |

If you want a softer instrument, use a generic intent interview. If you
have a pattern of starting and not finishing, use this.

## The eight-step process

0. **Pre-flight memory check** — search journal for prior similar attempts
1. **Hypothesis with confidence** — one sentence + 0–100% number
2. **One question at a time, each with a guess** — react-faster-than-generate
3. **Listen for "want vs. should-want"** — wildcard probe for buzzwords
4. **Five framework checks** — fail-by-default, named override required
5. **Enthusiasm detector → 24h pattern interrupt** — when applicable
6. **Write the commitment doc** — public artifact, pre-mortemed kill criteria
7. **Final confirmation** — explicit "GO" typed by user
8. **Handoff** — to `spec-driven-dev` if GO, journal entry if NO-GO

Full mechanics in [SKILL.md](SKILL.md).

## Output

```
runs/<YYMMDD-HHMM>-go-no-go-<slug>/
├── transcript.md           # full conversation
├── commitment.md           # the artifact
├── memory-check.md         # Step 0 search results
├── framework-checks.md     # 5 check details with reasons
└── decision.md             # GO / NO-GO / PAUSED
```

If GO and `public_commitment.enabled` is true (default), the commitment
doc is also posted to your configured public surface (Gist / GitHub repo
/ Substack draft / Twitter draft).

## Memory store modes

```yaml
memory:
  mode: file         # file | vault | git
  path: ~/.go-no-go/journal.md
```

- **file** — single markdown file, simplest, zero dependencies
- **vault** — semantic search across Obsidian / Logseq / any markdown vault
- **git** — `git log --grep` across a "decisions" repo

## Integration with other lich-skills

- `spec-driven-dev` — Stage 1. If GO, the commitment doc feeds the Spec
  phase as input.
- `debug-hypothesis` — orthogonal. Debug-hypothesis applies to bugs in
  running code; go-no-go applies to whether code should be written at all.
- `subagent-brief` — orthogonal. Subagent-brief is token discipline within
  a delegation; go-no-go is project-level discipline before delegation.

## Configuration

See [`templates/config.yml`](templates/config.yml) for the full schema and
[`packs/`](packs/) for starter packs.

## Why the default is NO-GO

Most decision tools default to "continue with adjustments." That bias
compounds the start-too-many problem. By making NO-GO the default and
requiring evidence to flip it, the skill aligns with the underlying
truth: most ideas should not be pursued, and the ones that should are the
ones that can withstand five specific checks.

After ten sessions, you internalize that **the gate is the work**. The
project may or may not happen after. Both outcomes are productive.

## License

MIT. Part of [LichAmnesia/lich-skills](https://github.com/LichAmnesia/lich-skills).

## Credits

The one-question-at-a-time mechanism with confidence-numbered hypotheses
is borrowed from `addyosmani/agent-skills/interview-me`. The fail-by-default
posture, framework checks, memory store, pattern-interrupt, and public
commitment artifact are original to `go-no-go`.
