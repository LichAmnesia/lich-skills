# lich-skills

> Personal skill collection for **Claude Code**, **Gemini CLI**, and **OpenAI Codex** — by [@LichAmnesia](https://github.com/LichAmnesia).

一套个人向的 AI 编程代理技能集，覆盖规格驱动开发、网页搜索、图片生成三条主线。Telegraph-style, opinionated, no filler.

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

## Skills

| Skill | What it does |
|---|---|
| [`spec-driven-dev`](skills/spec-driven-dev/) | Full SDLC workflow: Spec → Plan → Build → Test → Review → Ship. Anti-rationalization tables, verification gates, atomic commits. |
| [`tavily-search`](skills/tavily-search/) | Web search + content extraction via the [Tavily](https://tavily.com) API. Use for fact-checking, docs lookup, source-cited research. |
| [`nano-banana`](skills/nano-banana/) | Text-to-image and image editing via Google's Nano Banana 2 (`gemini-3.1-flash-image-preview`). Supports `512 / 1K / 2K / 4K`. |

All skills read credentials from environment variables (`TAVILY_API_KEY`, `GEMINI_API_KEY`, etc.) — never hardcoded.

---

## Quick start

<details open>
<summary><b>Claude Code</b> (recommended)</summary>

Install Claude Code, then clone this repo into your global skills directory:

```bash
# 1. Install Claude Code (native installer)
curl -fsSL https://claude.ai/install.sh | bash
# or: brew install --cask claude-code

# 2. Install the skill collection
git clone https://github.com/LichAmnesia/lich-skills.git ~/.claude/skills/lich-skills

# 3. Verify
claude
> /skills
```

Full guide: [`docs/claude-code-setup.md`](docs/claude-code-setup.md).

</details>

<details>
<summary><b>Gemini CLI</b></summary>

```bash
# 1. Install Gemini CLI
npm install -g @google/gemini-cli

# 2. Install the skill collection as an extension
mkdir -p ~/.gemini/extensions
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
