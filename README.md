# lich-skills

> Personal skill collection for **Claude Code**, **Gemini CLI**, and **OpenAI Codex** — by [@LichAmnesia](https://github.com/LichAmnesia).

Telegraph-style, opinionated, no filler. Engineering judgment skills plus high-leverage utility tools.

中文版：[README-zh.md](README-zh.md)

---

## The go-no-go gate (Stage 0)

```
                          ┌─────────────────────────────────────┐
                          │   NO-GO is the default.             │
                          │   GO requires evidence.             │
                          └──────────────┬──────────────────────┘
                                         │
   MEMORY     →   HYPOTHESIS   →   FIVE CHECKS    →   24h INTERRUPT?   →   COMMITMENT
 ┌────────┐    ┌─────────────┐  ┌────────────────┐  ┌──────────────┐   ┌──────────────┐
 │ Search │    │ One-sentence│  │ Differentiation│  │ Enthusiasm   │   │ Public doc + │
 │ prior  │───▶│ guess +     │─▶│ Audience-fit   │─▶│ high? Wait   │──▶│ kill criteria│
 │ tries  │    │ confidence% │  │ Acquisition    │  │ 24h, restart │   │ D14/30/60/90 │
 └────────┘    └─────────────┘  │ Capacity       │  └──────────────┘   └──────┬───────┘
                                │ 7-Factor Wedge │                            │
                                └────────────────┘                            │
                                                                              ▼
                                                                       GO  → spec-driven-dev
                                                                       NO-GO → journal entry
```

Stage 0 before any `/spec`. Five framework gates, mandatory memory check against
prior attempts, 24h pattern-interrupt for high-enthusiasm signals, public commitment
artifact with pre-mortemed kill criteria. See [`skills/go-no-go/`](skills/go-no-go/).

---

## The spec-driven-dev loop

```
   DEFINE         PLAN           BUILD          TEST          REVIEW          SHIP
 ┌────────┐   ┌────────┐   ┌─────────┐   ┌────────┐   ┌────────┐   ┌────────┐
 │  Spec  │──▶│  Plan  │──▶│  Build  │──▶│  Test  │──▶│ Review │──▶│  Ship  │
 │  PRD   │   │ Tasks  │   │  Impl   │   │ Verify │   │  Gate  │   │  Tag   │
 └────────┘   └────────┘   └─────────┘   └────────┘   └────────┘   └────────┘
     ▲                                                                 │
     └─────────────────── feedback / regression ──────────────────────┘
```

One skill, six phases, explicit exit criteria per step. Pairs with `go-no-go` as
Stage 1 of the pipeline. See [`skills/spec-driven-dev/`](skills/spec-driven-dev/).

---

## The debug-hypothesis loop

```
                          ┌─────────────────────────────┐
                          │    all hypotheses rejected?  │
                          │    back to OBSERVE           │
                          └──────────┬──────────────────┘
                                     │
  OBSERVE  ──▶  HYPOTHESIZE  ──▶  EXPERIMENT  ──▶  CONCLUDE
     │              │                  │               │
     ▼              ▼                  ▼               ▼
  Reproduce      List 3-5          One test,       Root cause
  the bug,       causes +          max 5 lines,    confirmed
  collect        evidence           falsify         → fix +
  symptoms       for each          don't confirm   regression test
     │              │                  │               │
     │              │           ┌──────┘               │
     │              │           │ rejected?            │
     │              │           ▼                      │
     │              │     next hypothesis              │
     │              │                                  │
     └──────────────┴──── everything in DEBUG.md ──────┘
```

Scientific-method debugging. Prevents the #1 AI failure: bulldozing through a wrong theory. See [`skills/debug-hypothesis/`](skills/debug-hypothesis/).

---

## The aggregate-N-sources loop

```
                    Trajectories-as-environment
            ╔════════════════════════════════════════╗
            ║   src_1   src_2   src_3  ...   src_N   ║
            ║   [..]    [..]    [..]         [..]    ║
            ║                                        ║
            ║   not concatenated. not summarized.    ║
            ║              navigated.                ║
            ╚═══════════════════╤════════════════════╝
                                ▼
            ┌────────────────────────────────────────┐
            │       AGGREGATOR  (lite agent)         │
            │   inspect_file / inspect_section       │
            │   search_sources / cross_pack_check    │
            │                                        │
            │   notes = []  (every claim → path:line)│
            │   budget = 25 → loop until coverage    │
            └───────────────────┬────────────────────┘
                                ▼
                  pack/  brief.md / findings.md /
                         sources.tsv / _aggregation_log.md
```

Agentic aggregation for long-horizon research. N raw notes → 1 structured pack with full `path:line` provenance + cross-source contradictions surfaced. See [`skills/wiki-aggregate/`](skills/wiki-aggregate/).

---

## The build-until-pass loop

```
        ┌──────────────────────────────────────────────┐
        │  attempt > MAX (default 10)?                  │
        │  → STOP, report what's left, hand to human    │
        └───────────────────────┬──────────────────────┘
                                │ no
   RUN CHECK ──▶ exit 0? ──yes──▶  DONE  (green = exit code, not opinion)
       ▲             │
       │             │ no (red)
       │             ▼
       │      READ first error  ──▶  FIX smallest  ──▶  re-RUN
       │      verbatim, file:line    minimal diff,        │
       │                             never fake green     │
       └─────────────────────────────────────────────────┘
              one round = one fix + one re-run + one-line report
```

Turns the human out of the run → read error → fix one line → run again loop,
and caps the agent so it can't bulldoze 200-line speculative rewrites between
runs. Refuses to fake green (`@ts-ignore`, deleting tests, `|| true`). See [`skills/build-until-pass/`](skills/build-until-pass/).

---

## Skills

| Skill | What it does |
|---|---|
| [`go-no-go`](skills/go-no-go/) | **Stage 0 gate — NO-GO is the default.** Runs before `/spec` to decide whether a project should start at all. Memory check against prior attempts + 5 framework gates (Differentiation · Audience–Market Fit · Acquisition Channel · Capacity · 7-Factor Wedge) + 24h pattern-interrupt if enthusiasm-high + public commitment doc with D14/D30/D60/D90 kill criteria. 3 starter packs (solo-founder · indie-dev · content-creator). |
| [`spec-driven-dev`](skills/spec-driven-dev/) | Full SDLC workflow: Spec → Plan → Build → Test → Review → Ship. Anti-rationalization tables, verification gates, atomic commits. Pairs with `go-no-go` as Stage 1 of the pipeline. |
| [`debug-hypothesis`](skills/debug-hypothesis/) | Scientific-method debugging: Observe → Hypothesize → Experiment → Conclude. Anti-bulldozer rules, max 5-line experiments, mandatory `DEBUG.md` evidence trail. |
| [`wiki-aggregate`](skills/wiki-aggregate/) | Lift N≥3 raw research artifacts into one structured pack via agentic aggregation. Cheap-pass + tool-budgeted aggregator loop, every claim has `path:line` provenance, cross-source contradictions logged. |
| [`tavily-search`](skills/tavily-search/) | Web search + content extraction via the [Tavily](https://tavily.com) API. Use for fact-checking, docs lookup, source-cited research. |
| [`nano-banana`](skills/nano-banana/) | Text-to-image and image editing via Google's Nano Banana 2 (`gemini-3.1-flash-image-preview`). Supports `512 / 1K / 2K / 4K`. |
| [`frontend-design`](skills/frontend-design/) | Build distinctive, production-grade frontend interfaces — bold aesthetic direction, intentional typography, and motion that avoids generic AI-slop UI. Adapted from Anthropic's official `frontend-design` skill (Apache-2.0). |
| [`google-analytics`](skills/google-analytics/) | Analyze GA4 data + ship an out-of-the-box **SEO daily report** — point it at one property and get organic KPIs (28d-vs-prior-28d), same-weekday anomaly detection, top organic landing pages, by-engine/country/device cuts, and prioritized recommendations. Plus general analyses (overview / sources / content / devices / seo). **TypeScript** scripts (Bun / `npx tsx`) over the official `@google-analytics/data` client, `conversions`↔`keyEvents` auto-detect. Reads `GOOGLE_ANALYTICS_PROPERTY_ID` + service-account JSON from env. |
| [`subagent-brief`](skills/subagent-brief/) | Pre-flight discipline for spawning subagents. Anthropic does NOT share prefix across subagents — each one cold-starts on the full prompt. Compress every subagent prompt into a ≤200-word brief before spawning. Five rules + brief template + anti-rationalization table. Backed by arXiv 2604.25899 (Pythia, 2026). |
| [`build-until-pass`](skills/build-until-pass/) | Bounded self-correcting loop: run the build/typecheck/test command → read the first error → apply the smallest fix → re-run → repeat until **exit code 0** or a hard attempt cap (default 10). Green is the exit code, not the agent's opinion. Minimal-diff-per-round + cap kill both failure modes — human-as-while-loop and agent-as-bulldozer. Refuses to fake green (`@ts-ignore`, deleting tests, `\|\| true`). |

All skills read credentials from environment variables (`TAVILY_API_KEY`, `GEMINI_API_KEY`, etc.) — never hardcoded.

---

## Quick install

<details open>
<summary><b>Claude Code — plugin marketplace (one command)</b></summary>

Inside a running Claude Code session:

```
/plugin marketplace add LichAmnesia/lich-skills
/plugin install lich-skills@lich-skills
```

Done. All skills become available immediately. Verify:

```
/skills
```

</details>

<details>
<summary><b>Claude Code — git clone</b></summary>

```bash
# 1. Install Claude Code (if not already)
curl -fsSL https://claude.ai/install.sh | bash
# or: brew install --cask claude-code

# 2. Clone into the global skills directory
git clone https://github.com/LichAmnesia/lich-skills.git ~/.claude/skills/lich-skills

# 3. Start Claude Code
claude
> /skills
```

Full guide: [`docs/claude-code-setup.md`](docs/claude-code-setup.md).

</details>

<details>
<summary><b>Gemini CLI — extensions install (one command)</b></summary>

```bash
gemini extensions install https://github.com/LichAmnesia/lich-skills
```

This repo ships a [`gemini-extension.json`](gemini-extension.json) at the root, so Gemini CLI installs it as a first-class extension and auto-discovers every `skills/*/SKILL.md`. Verify:

```bash
gemini extensions list
```

Manual clone fallback:

```bash
npm install -g @google/gemini-cli
git clone https://github.com/LichAmnesia/lich-skills.git ~/.gemini/extensions/lich-skills
```

Full guide: [`docs/gemini-cli-setup.md`](docs/gemini-cli-setup.md).

</details>

<details>
<summary><b>OpenAI Codex CLI</b></summary>

```bash
# 1. Install Codex CLI
npm install -g @openai/codex
# or: brew install --cask codex

# 2. Install the skill collection
mkdir -p ~/.codex/skills
git clone https://github.com/LichAmnesia/lich-skills.git ~/.codex/skills/lich-skills
```

Full guide: [`docs/codex-setup.md`](docs/codex-setup.md).

</details>

---

## Why the one-liners work

- **`/plugin marketplace add LichAmnesia/lich-skills`** — Claude Code reads [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) at the repo root. That file declares the repo as a plugin marketplace and points the plugin back at its GitHub source.
- **`/plugin install lich-skills@lich-skills`** — format is `<plugin-name>@<marketplace-name>`. Both resolve from the same marketplace manifest, which is why the name appears twice.
- **`gemini extensions install <github-url>`** — Gemini CLI's native `extensions` subcommand clones any public GitHub repo that has a `gemini-extension.json` at its root, then auto-discovers bundled skills from `skills/*/SKILL.md`. The manifest is what makes this one-liner work — without it, Gemini CLI refuses to install the repo as an extension.
- **[geminicli.com/extensions/](https://geminicli.com/extensions/) listing** — the public extension gallery sources third-party extensions from GitHub repos that have the same `gemini-extension.json` manifest. Having the manifest is necessary (though not sufficient) to appear there.
- **`git clone` into `~/.claude/skills/`** — the lowest-common-denominator path. Claude Code reads every `SKILL.md` under `~/.claude/skills/**` on session start. No marketplace required.

---

## Documentation

| Tool | Install + skill setup |
|---|---|
| Claude Code | [`docs/claude-code-setup.md`](docs/claude-code-setup.md) |
| Gemini CLI | [`docs/gemini-cli-setup.md`](docs/gemini-cli-setup.md) |
| OpenAI Codex | [`docs/codex-setup.md`](docs/codex-setup.md) |

---

## Security

No secrets committed. Repo scanned with [`gitleaks`](https://github.com/gitleaks/gitleaks) via pre-commit hook and CI on every PR. Skills use environment variables only; example configs use `YOUR_API_KEY_HERE` placeholders. Report any leaked credential via a [private security advisory](https://github.com/LichAmnesia/lich-skills/security/advisories/new).

---

## Contributing

PRs welcome. New skills should be **specific**, **verifiable**, and **minimal**. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

## License

[MIT](LICENSE) © 2026 Shen Huang ([@LichAmnesia](https://github.com/LichAmnesia))

---

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=LichAmnesia/lich-skills&type=Date)](https://www.star-history.com/#LichAmnesia/lich-skills&Date)
