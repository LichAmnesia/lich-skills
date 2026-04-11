# OpenAI Codex CLI setup

Install [OpenAI Codex CLI](https://github.com/openai/codex), then register `lich-skills` under `~/.codex/skills/`.

## 1. Install Codex CLI

### npm (recommended)

```bash
npm install -g @openai/codex
```

Requires Node.js 20+.

### Homebrew (macOS / Linux)

```bash
brew install --cask codex
```

### Verify

```bash
codex --version
```

First run authenticates via your ChatGPT account or an `OPENAI_API_KEY` environment variable.

Reference: <https://github.com/openai/codex>

---

## 2. Install the lich-skills collection

Codex CLI reads per-user configuration from `~/.codex/`. Skills live under `~/.codex/skills/<name>/`.

```bash
mkdir -p ~/.codex/skills
git clone https://github.com/LichAmnesia/lich-skills.git ~/.codex/skills/lich-skills
```

### Alternative — AGENTS.md include

Codex CLI honors `AGENTS.md` files for persistent instructions. If you prefer keeping the repo outside `~/.codex`:

```bash
git clone https://github.com/LichAmnesia/lich-skills.git ~/ws/oss/lich-skills
```

Then add the following block to `~/.codex/AGENTS.md` (create it if missing):

```md
## Skills

Skill definitions live at `~/ws/oss/lich-skills/skills/`:

- spec-driven-dev — Spec → Plan → Build → Test → Review → Ship workflow
- tavily-search   — Web search + extraction via Tavily
- nano-banana     — Text-to-image and image edits via Nano Banana 2

Load the matching `SKILL.md` before acting when a user request matches one of these triggers.
```

### Per-project install

```bash
cd /path/to/your/project
mkdir -p .codex/skills
git clone https://github.com/LichAmnesia/lich-skills.git .codex/skills/lich-skills
```

Commit or gitignore depending on whether you want your team to share the skill set.

---

## 3. Verify

```bash
codex
> list the skills available under ~/.codex/skills
```

Or trigger one directly:

```
> use the nano-banana skill to generate a hero image at 2K resolution
```

---

## 4. Update

```bash
cd ~/.codex/skills/lich-skills
git pull --rebase
```

---

## 5. Uninstall

```bash
rm -rf ~/.codex/skills/lich-skills
```

Remove any `AGENTS.md` block you added in the alternative setup.
