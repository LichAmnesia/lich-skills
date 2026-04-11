# Gemini CLI setup

Install [Gemini CLI](https://github.com/google-gemini/gemini-cli), then install `lich-skills` as a first-class extension. This repo ships a [`gemini-extension.json`](../gemini-extension.json) manifest at the root, so the one-line `gemini extensions install` command just works.

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

## 2. Install the lich-skills extension

### Option A — One-line install (recommended)

```bash
gemini extensions install https://github.com/LichAmnesia/lich-skills
```

Gemini CLI clones the repo into `~/.gemini/extensions/lich-skills`, reads the `gemini-extension.json` manifest at the root, and auto-discovers every `skills/*/SKILL.md` inside the extension. The model activates skills contextually when a user request matches a `description` frontmatter.

Verify:

```bash
gemini extensions list
```

You should see `lich-skills` listed.

### Option B — Manual clone

If you want to edit the skills locally or you need a specific branch:

```bash
mkdir -p ~/.gemini/extensions
git clone https://github.com/LichAmnesia/lich-skills.git ~/.gemini/extensions/lich-skills
```

Gemini CLI still picks up the extension because the `gemini-extension.json` manifest is inside the cloned directory.

### Option C — Per-project

For a project-scoped install that lives inside the repo you are working on:

```bash
cd /path/to/your/project
mkdir -p .gemini/extensions
git clone https://github.com/LichAmnesia/lich-skills.git .gemini/extensions/lich-skills
```

Gemini CLI merges project-level extensions with user-level ones on session start.

### Option D — GEMINI.md include (fallback)

If you do not want an extension install for some reason, you can reference the skills directory from `~/.gemini/GEMINI.md` as persistent context:

```bash
git clone https://github.com/LichAmnesia/lich-skills.git ~/projects/lich-skills
```

Append to `~/.gemini/GEMINI.md`:

```md
# Skills

Refer to the skill definitions under:
`~/projects/lich-skills/skills/`

- spec-driven-dev — full SDLC workflow (Spec → Plan → Build → Test → Review → Ship)
- tavily-search   — web search + extraction via Tavily
- nano-banana     — text-to-image and image edits via Nano Banana 2
```

This path loses automatic skill activation, so prefer Option A unless you have a reason not to.

---

## 3. Verify

Launch Gemini CLI and ask it to list loaded skills:

```bash
gemini
> /extensions list
```

Or invoke one directly:

```
> use the tavily-search skill to find the latest Gemini CLI release notes
```

---

## 4. Update

```bash
gemini extensions update lich-skills
```

Or, for manual clones:

```bash
cd ~/.gemini/extensions/lich-skills
git pull --rebase
```

---

## 5. Uninstall

```bash
gemini extensions uninstall lich-skills
```

Or:

```bash
rm -rf ~/.gemini/extensions/lich-skills
```
