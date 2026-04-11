# Claude Code setup

Install Claude Code, then drop the `lich-skills` collection into your global skills directory.

## 1. Install Claude Code

Claude Code is Anthropic's official CLI coding agent. Pick one install method:

### Native installer (recommended)

macOS / Linux / WSL:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Windows PowerShell:

```powershell
irm https://claude.ai/install.ps1 | iex
```

The native installer auto-updates in the background.

### Homebrew (macOS / Linux)

```bash
brew install --cask claude-code
```

Use `brew install --cask claude-code@latest` if you want the latest channel instead of stable. Homebrew casks do **not** auto-update — run `brew upgrade claude-code` periodically.

### npm (deprecated but still supported)

```bash
npm install -g @anthropic-ai/claude-code
```

Requires Node.js 18+. Do **not** run with `sudo`.

### Verify

```bash
claude --version
claude doctor    # deeper health check
```

Authenticate by running `claude` once and following the browser prompt. Claude Code requires a Pro, Max, Team, Enterprise, or Console account.

Reference: <https://code.claude.com/docs/en/setup>

---

## 2. Install the lich-skills collection

Claude Code loads skills from `~/.claude/skills/` (global) or `.claude/skills/` (per-project). Clone directly into the global directory:

```bash
mkdir -p ~/.claude/skills
git clone https://github.com/LichAmnesia/lich-skills.git ~/.claude/skills/lich-skills
```

This places each `skills/<skill-name>/SKILL.md` on the Claude Code skill search path.

### Alternative: per-project install

If you only want the skills inside a single repo:

```bash
cd /path/to/your/project
mkdir -p .claude/skills
git clone https://github.com/LichAmnesia/lich-skills.git .claude/skills/lich-skills
```

Add `.claude/skills/lich-skills` to that project's `.gitignore` unless you want to vendor it.

### Alternative: symlink from an existing clone

```bash
git clone https://github.com/LichAmnesia/lich-skills.git ~/projects/lich-skills
ln -s ~/projects/lich-skills ~/.claude/skills/lich-skills
```

---

## 3. Verify skills are loaded

Launch Claude Code inside any directory and list skills:

```bash
claude
```

Inside the session:

```
> /skills
```

You should see `spec-driven-dev`, `tavily-search`, and `nano-banana` in the list. To invoke one explicitly:

```
> use the spec-driven-dev skill to plan a new CLI tool
```

Claude Code also auto-activates a skill when the conversation matches its `description` frontmatter.

---

## 4. Update

```bash
cd ~/.claude/skills/lich-skills
git pull --rebase
```

No restart needed — Claude Code rereads skills on each new session.

---

## 5. Uninstall

```bash
rm -rf ~/.claude/skills/lich-skills
```

Or use `trash` on macOS if you prefer a recoverable delete.
