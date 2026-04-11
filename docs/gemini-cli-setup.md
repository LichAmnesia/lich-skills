# Gemini CLI setup

Install [Gemini CLI](https://github.com/google-gemini/gemini-cli), then wire up the `lich-skills` collection as an extension or via `GEMINI.md`.

## 1. Install Gemini CLI

### npm (recommended)

```bash
npm install -g @google/gemini-cli
```

Requires Node.js 20+.

### npx (no global install)

```bash
npx @google/gemini-cli
```

### Verify

```bash
gemini --version
```

First run will prompt for auth (Google AI Studio API key, OAuth, or Vertex AI).

Reference: <https://github.com/google-gemini/gemini-cli>

---

## 2. Install the lich-skills collection

Gemini CLI reads per-user configuration from `~/.gemini/`. Skills ship as plain Markdown, so there are two equivalent paths.

### Option A — Extensions directory (recommended)

Gemini CLI supports extensions loaded from `~/.gemini/extensions/<name>/`. Clone the repo there:

```bash
mkdir -p ~/.gemini/extensions
git clone https://github.com/LichAmnesia/lich-skills.git ~/.gemini/extensions/lich-skills
```

Each `SKILL.md` is then discoverable as context when Gemini CLI loads its extension set.

### Option B — GEMINI.md include

Gemini CLI reads `~/.gemini/GEMINI.md` as persistent context. Clone anywhere, then reference the skills directory from that file:

```bash
git clone https://github.com/LichAmnesia/lich-skills.git ~/ws/oss/lich-skills
```

Append to `~/.gemini/GEMINI.md`:

```md
# Skills

Refer to the skill definitions under:
`~/ws/oss/lich-skills/skills/`

- spec-driven-dev — full SDLC workflow (Spec → Plan → Build → Test → Review → Ship)
- tavily-search   — web search + extraction via Tavily
- nano-banana     — text-to-image and image edits via Nano Banana 2
```

### Option C — Per-project

```bash
cd /path/to/your/project
mkdir -p .gemini
git clone https://github.com/LichAmnesia/lich-skills.git .gemini/skills
```

Then reference `.gemini/skills/` from a project-local `GEMINI.md`.

---

## 3. Verify

Launch Gemini CLI and ask it to list its loaded context:

```bash
gemini
> what skills are loaded from lich-skills?
```

Or invoke one directly:

```
> use the tavily-search skill to find the latest Gemini CLI release notes
```

---

## 4. Update

```bash
cd ~/.gemini/extensions/lich-skills
git pull --rebase
```

---

## 5. Uninstall

```bash
rm -rf ~/.gemini/extensions/lich-skills
```

Remove any `GEMINI.md` references you added in Option B.
