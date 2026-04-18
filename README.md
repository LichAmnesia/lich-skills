# lich-skills

> Personal skill collection for **Claude Code**, **Gemini CLI**, and **OpenAI Codex** — by [@LichAmnesia](https://github.com/LichAmnesia).

Telegraph-style, opinionated, no filler. Engineering judgment skills plus high-leverage utility tools.

中文版：[README-zh.md](README-zh.md)

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

One skill, six phases, explicit exit criteria per step. See [`skills/spec-driven-dev/`](skills/spec-driven-dev/).

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

## Skills

| Skill | What it does |
|---|---|
| [`spec-driven-dev`](skills/spec-driven-dev/) | Full SDLC workflow: Spec → Plan → Build → Test → Review → Ship. Anti-rationalization tables, verification gates, atomic commits. |
| [`debug-hypothesis`](skills/debug-hypothesis/) | Scientific-method debugging: Observe → Hypothesize → Experiment → Conclude. Anti-bulldozer rules, max 5-line experiments, mandatory `DEBUG.md` evidence trail. |
| [`wiki-aggregate`](skills/wiki-aggregate/) | Lift N≥3 raw research artifacts into one structured pack via agentic aggregation. Cheap-pass + tool-budgeted aggregator loop, every claim has `path:line` provenance, cross-source contradictions logged. |
| [`tavily-search`](skills/tavily-search/) | Web search + content extraction via the [Tavily](https://tavily.com) API. Use for fact-checking, docs lookup, source-cited research. |
| [`nano-banana`](skills/nano-banana/) | Text-to-image and image editing via Google's Nano Banana 2 (`gemini-3.1-flash-image-preview`). Supports `512 / 1K / 2K / 4K`. |

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

Done. All five skills become available immediately. Verify:

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
