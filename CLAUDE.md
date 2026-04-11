# CLAUDE.md — lich-skills

Guidance for Claude Code when working inside this repository.

## What this repo is

`lich-skills` is an open-source collection of Claude Code skills. Public, MIT-licensed. Three skills today:

- `spec-driven-dev` — Spec → Plan → Build → Test → Review → Ship workflow
- `tavily-search` — web search via the Tavily API
- `nano-banana` — image generation/edit via Google's Nano Banana 2

## Hard rules (repo is public)

1. **No secrets.** Never commit API keys, tokens, `.env` files, service-account JSON. A `gitleaks` pre-commit hook runs on every commit — do not bypass it with `--no-verify`.
2. **Env vars only.** Skills read credentials from environment variables (`TAVILY_API_KEY`, `GEMINI_API_KEY`, etc.). Never hardcode. Use `YOUR_API_KEY_HERE` in examples.
3. **No private file paths.** Example paths in skill docs should be generic (`~/project/`, `./output.png`) — never reference the author's private workspace.
4. **MIT license.** All new files inherit MIT. Do not paste copyrighted code from other projects without attribution and license compatibility.

## Skill format

Every skill lives at `skills/<name>/SKILL.md` with YAML frontmatter:

```yaml
---
name: skill-name
description: One-line trigger description starting with "Use when..."
---
```

Follow the process-not-prose convention: clear steps, exit criteria, rationalization tables.

## Conventional commits

`feat|fix|refactor|docs|chore|ci|test` + scope. English. Example: `feat(tavily): add search skill`.

## Before every commit

1. `gitleaks detect --config .gitleaks.toml --source .` — clean
2. Skill runs locally (for script-backed skills)
3. README skills table is up to date
