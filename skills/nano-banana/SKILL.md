---
name: nano-banana
description: Generate or edit images with Google's Nano Banana 2 (`gemini-3.1-flash-image-preview`). Use when the user asks to generate an image, edit an image, or create a picture. Supports 512 / 1K / 2K / 4K resolutions.
---

# Nano Banana 2

Text-to-image and image edit via Google's **Nano Banana 2** model, aka `gemini-3.1-flash-image-preview`. Fast, cheap, high-quality. Returns PNG.

## When to use

- User asks for an image, picture, photo, thumbnail, cover art, poster, icon, etc.
- User provides an input image and wants it modified (background change, object removal, style swap)
- You need a quick visual for a blog post, README, demo, or slide

## When NOT to use

- User wants a video — Nano Banana is image-only
- User wants a pixel-perfect UI mockup — use a design tool
- User needs a specific licensed stock photo — use a stock service

## Setup

1. Get a Gemini API key: https://aistudio.google.com/app/apikey
2. Export it:

   ```bash
   export GEMINI_API_KEY="YOUR_KEY_HERE"
   # or
   export GOOGLE_API_KEY="YOUR_KEY_HERE"
   ```

3. Install `uv` if missing:

   ```bash
   command -v uv || curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

First run auto-installs `google-genai` and `pillow` via `uv`'s inline script deps.

## Generate

```bash
uv run ~/.claude/skills/lich-skills/skills/nano-banana/scripts/generate_image.py \
    --prompt "A cinematic rainy Tokyo alley, neon reflections, 35mm, low angle" \
    --filename "tokyo-alley.png" \
    --resolution 1K
```

Output is saved to `tokyo-alley.png` in the current directory unless the filename is absolute.

## Edit

Pass an input image with `--input-image`. The model sees the image + your instruction.

```bash
uv run .../generate_image.py \
    --prompt "Remove the crowd behind the subject. Keep framing and grading unchanged." \
    --filename "cleaned.png" \
    --input-image "./portrait.png" \
    --resolution 2K
```

When editing, the script auto-matches output resolution to the input's dimensions unless you explicitly pass `--resolution`.

## Flags

| Flag | Default | Purpose |
|------|---------|---------|
| `--prompt`, `-p` | required | Image description or edit instruction |
| `--filename`, `-f` | required | Output path (PNG) |
| `--input-image`, `-i` | — | Source image for editing |
| `--resolution`, `-r` | `1K` | One of `512`, `1K`, `2K`, `4K` |
| `--api-key`, `-k` | env | Overrides `GEMINI_API_KEY` / `GOOGLE_API_KEY` |
| `--model`, `-m` | `gemini-3.1-flash-image-preview` | Rarely needed |

## Resolution mapping

Map loose user language to a resolution flag:

| User says | Use |
|-----------|-----|
| (nothing) | `1K` |
| "small", "thumbnail", "quick draft" | `512` |
| "normal", "medium" | `1K` |
| "high quality", "large" | `2K` |
| "4k", "print", "wallpaper" | `4K` |

## Prompt template (generation)

```
Subject: <subject>.
Style: <photo | illustration | 3D | painting | pixel art | ...>.
Composition: <shot type, angle>.
Lighting: <lighting description>.
Background: <background>.
Avoid: <what should NOT be in the image>.
```

## Prompt template (editing)

```
Change only: <the specific edit>.
Keep subject, framing, lighting, palette, text, and overall style unchanged.
```

Being explicit about what to keep is the difference between a clean edit and a total re-render.

## Environment

- Key lookup order: `--api-key` → `GEMINI_API_KEY` → `GOOGLE_API_KEY`
- Output format: PNG (RGBA converted to RGB on white background)
- Never prints the API key or image bytes to stdout

## Fast checks

```bash
command -v uv
test -n "$GEMINI_API_KEY" || test -n "$GOOGLE_API_KEY"
# If editing:
test -f ./input.png
```

## Common failures

| Error | Fix |
|------|-----|
| `Error: No API key provided.` | Export `GEMINI_API_KEY` or pass `--api-key` |
| `Error loading input image:` | Bad path or unreadable file |
| `Error: No image was generated in the response.` | Prompt too vague or unsafe — rewrite |
| `403` / `quota` | Wrong key, region-locked, or over quota |

## Red flags

- Hardcoding the API key in any script or example
- Committing generated images to git without checking size
- Re-running the same prompt 10 times hoping for luck — instead, rewrite the prompt with the template above

## Verification

- [ ] `$GEMINI_API_KEY` or `$GOOGLE_API_KEY` set in env, not in files
- [ ] A test generation produces a PNG at the expected path
- [ ] `gitleaks detect --source .` clean
