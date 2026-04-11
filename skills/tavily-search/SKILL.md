---
name: tavily-search
description: Web search and content extraction via the Tavily API. Use when you need real-time web results, citations, or raw article content without a browser. Requires TAVILY_API_KEY.
---

# Tavily Search

Headless web search and content extraction using [Tavily](https://tavily.com). Built for LLM agents — returns clean, summarised results with optional raw article bodies. No browser required.

## When to use

- You need up-to-date web information (news, docs, pricing, facts)
- You want cited sources with URLs for a research/writing task
- You need the full readable body of a URL as markdown
- Brave/Google search is not available or rate-limited

## When NOT to use

- You already have the page in your context
- The answer is static and likely in the model's training data
- You need to interact with a page (login, click) — use a browser MCP instead

## Setup

1. Get a free API key: https://app.tavily.com (1000 free searches/month)
2. Export it:

   ```bash
   export TAVILY_API_KEY="tvly-YOUR_KEY_HERE"
   ```

   Add to `~/.zshrc` or `~/.bashrc` for persistence. **Never commit the key.**

3. First run will auto-install dependencies via `uv`:

   ```bash
   command -v uv || curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

## Search

```bash
# Basic search — 5 results, summarised answer
uv run ~/.claude/skills/lich-skills/skills/tavily-search/scripts/search.py "your query"

# More results
uv run .../search.py "your query" --max-results 10

# Include full article bodies (slower, more tokens)
uv run .../search.py "your query" --raw-content

# Deeper search with higher recall
uv run .../search.py "your query" --depth advanced

# News-only, last 7 days
uv run .../search.py "your query" --topic news --days 7

# Output as JSON
uv run .../search.py "your query" --json
```

### Flags

| Flag | Default | Purpose |
|------|---------|---------|
| `--max-results N` | `5` | Number of results to return (1–20) |
| `--depth {basic,advanced}` | `basic` | `advanced` = slower, higher quality |
| `--topic {general,news}` | `general` | News mode adds recency filtering |
| `--days N` | — | With `--topic news`, restrict to last N days |
| `--raw-content` | off | Include full article body as markdown |
| `--include-domains a,b` | — | Restrict to comma-separated domains |
| `--exclude-domains a,b` | — | Exclude comma-separated domains |
| `--json` | off | Machine-readable JSON output |

## Extract a single URL

```bash
uv run .../search.py --extract https://example.com/article
```

Returns clean markdown of the page body (no nav, ads, or boilerplate).

## Output format (default, human-readable)

```
ANSWER: <Tavily's synthesised answer, 1–3 sentences>

RESULTS:
[1] <title>
    <url>
    <snippet — 1–2 sentences>

[2] ...
```

With `--raw-content` each result gets an indented markdown body below the snippet.

## Examples

Research a library:

```bash
uv run .../search.py "Gemini 3 Flash Image API pricing" --depth advanced
```

Get the full article body of a blog post:

```bash
uv run .../search.py --extract https://blog.example.com/post --json > post.json
```

News sweep:

```bash
uv run .../search.py "OpenAI Codex release" --topic news --days 3 --max-results 10
```

## Environment

- Key lookup order: `--api-key` flag → `$TAVILY_API_KEY` → `$TAVILY_KEY`
- Default model: Tavily's `search` and `extract` endpoints (v1)
- Default timeout: 30s per request

## Common failures

| Error | Fix |
|------|-----|
| `Error: No TAVILY_API_KEY` | Export the key or pass `--api-key` |
| `401 Unauthorized` | Key is wrong, revoked, or over quota |
| `429 Rate limit` | Wait or upgrade plan |
| `No results` | Broaden query, try `--depth advanced`, drop domain filters |

## Red flags

- Hardcoding the API key anywhere in this repo
- Passing the key on the command line in shared terminals (shell history leak)
- Using `--raw-content` with `--max-results 20` on every query (burns tokens)

## Verification

- [ ] `$TAVILY_API_KEY` is set in env, not in files
- [ ] `uv run .../search.py "hello world"` returns results
- [ ] `gitleaks detect --source .` clean
