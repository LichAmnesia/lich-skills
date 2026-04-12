# Contributing to lich-skills

Thanks for considering a contribution. This repo is a personal skill collection, but high-quality PRs that match the style are welcome.

## Ground rules

- **Specific** — actionable steps, not vague advice.
- **Verifiable** — clear exit criteria. Every skill ends with evidence requirements.
- **Battle-tested** — based on a real workflow you actually use.
- **Minimal** — only what's needed to guide the agent. No filler.
- **File size** — keep individual files under ~500 LOC. Split when they grow.

## Skill and Tool anatomy

This repository supports both **Skills** (markdown prompts) and **Tools** (executable code via MCP).

### 1. Skills (Prompts)

Each skill lives in `skills/<skill-name>/SKILL.md` with YAML frontmatter:

```yaml
---
name: skill-name
description: Use when <trigger condition>. One sentence.
---
```

Body sections, in order:

1. **Overview** — what the skill does in 2–3 lines.
2. **When to Use** — explicit trigger conditions.
3. **Process** — numbered, verifiable steps.
4. **Anti-rationalizations** — table of common excuses with rebuttals.
5. **Verification** — evidence the skill was applied correctly.

### 2. Tools (MCP)

Tools are exposed via the **Model Context Protocol (MCP)** server in `index.js`. If your skill requires an executable script (e.g., Python or Node.js):

1.  Place your script in `skills/<skill-name>/scripts/`.
2.  Register the tool in `index.js` within the `ListToolsRequestSchema` handler.
3.  Implement the tool's logic in the `CallToolRequestSchema` handler in `index.js`.
4.  Ensure any new dependencies are added to `package.json`.
5.  Use `uv run` for Python scripts to handle dependencies automatically via inline script metadata.

## Workflow

```bash
# 1. Fork + clone
git clone https://github.com/<you>/lich-skills.git
cd lich-skills

# 2. Branch
git checkout -b feat/<skill-name>

# 3. Add / edit skill or tool
#    skills/<skill-name>/SKILL.md
#    skills/<skill-name>/scripts/  (if tool-backed)
#    index.js (if tool-backed)
#    package.json (if new dependencies)

# 4. Install dependencies
npm install

# 5. Scan for secrets before pushing
gitleaks detect --no-banner

# 6. Commit (Conventional Commits)
git commit -m "feat(<skill-name>): add <short description>"

# 7. Open PR against main
gh pr create --fill
```

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

| Type | When |
|---|---|
| `feat` | New skill or new capability in an existing skill |
| `fix` | Bug fix in a skill script or prompt |
| `docs` | README / setup guide changes only |
| `refactor` | Skill restructure without behavior change |
| `chore` | Tooling, CI, metadata |

Scope is usually the skill name: `feat(tavily-search): add domain filters`.

## PR checklist

- [ ] Skill frontmatter present and valid
- [ ] Process steps have explicit verification
- [ ] No secrets, no API keys, no personal paths in skill body
- [ ] `gitleaks detect` passes locally
- [ ] README updated if a new skill was added
- [ ] Commit message follows Conventional Commits

## Security

Never commit API keys, tokens, or personal credentials. If you spot a leaked secret, open a [private security advisory](https://github.com/LichAmnesia/lich-skills/security/advisories/new) rather than a public issue.

## License

By contributing, you agree your work is released under the [MIT License](LICENSE).
