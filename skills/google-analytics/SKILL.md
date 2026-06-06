---
name: google-analytics
description: Analyze Google Analytics 4 data — review website performance, identify traffic patterns, diagnose high-bounce pages, compare time periods, and suggest data-driven improvements. Use when the user asks about analytics, website metrics, traffic analysis, conversion rates, user behavior, or performance optimization.
---

# Google Analytics 4 Analysis

Pull GA4 data via the Data API and turn it into actionable, prioritized recommendations. Scripts are **TypeScript** (run with [Bun](https://bun.sh) or `npx tsx`).

## When to use

- "Give me a daily SEO report for this property" → **`daily-report.ts`** (the out-of-the-box default)
- "Review our Google Analytics performance for the last 30 days"
- "How is organic search doing?" / "Which landing pages pull organic traffic?"
- "What are our top traffic sources?"
- "Which pages have the highest bounce rates?"
- "Compare this month vs last month"
- "Why is mobile converting worse than desktop?"

## When NOT to use

- Real-time / streaming analytics — this uses the batch reporting API
- Editing GA config, audiences, or events — read-only by design
- Anything needing PII / individual-user data — GA4 returns aggregates only

## Setup

### 1. Credentials (env vars)

```bash
export GOOGLE_ANALYTICS_PROPERTY_ID="YOUR_PROPERTY_ID_HERE"   # numeric, not the G- id
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

Or copy [`.env.example`](.env.example) → `.env` (Bun auto-loads `.env`; under `tsx`, export the vars instead). Full service-account walkthrough is inside `.env.example`.

**Never commit the JSON key or `.env`.** Store the key outside the repo; grant the service account only the **Viewer** role on the GA4 property.

### 2. Install the one dependency

```bash
cd skills/google-analytics/scripts
bun install            # or: npm install
```

The only runtime dep is `@google-analytics/data` (official Google client, fully typed).

## Scripts

### `daily-report.ts` — SEO daily report (out-of-the-box default) ⭐

Point it at **one property** and get a complete, opinionated organic-search report — zero config beyond credentials. This is the SEO-expert default template.

```bash
bun run daily-report.ts --property 123456789      # one property → one report
bun run daily-report.ts                            # uses GOOGLE_ANALYTICS_PROPERTY_ID
bun run daily-report.ts --format json --output today.json
```

Default template (in order): **Organic KPIs** (rolling 28d vs prior 28d — the Search-Console 4-week-block convention that removes day-of-week skew) · **daily anomaly check** (yesterday vs *same weekday* last week, flags drops ≥ 25%) · **organic trend** sparkline · **top organic landing pages** (the SEO money view) · **by search engine** · **by country** · **by device** (mobile-first) · **auto-generated prioritized recommendations**. Everything is filtered to `sessionDefaultChannelGroup = "Organic Search"`.

Flags: `--property <id>`, `--days <n>` (default 28), `--channel <name>` (default `"Organic Search"`), `--anomaly-threshold <pct>` (default 25), `--format md|json` (default md), `--output FILE`, `--help`. Writes `seo-daily-<date>.md` by default.

It auto-detects whether the property uses GA4's `conversions` or the newer `keyEvents` metric, and any single failing sub-query degrades gracefully instead of aborting the report.

> **GA4 limitation:** GA4 has no keyword / impression / CTR / average-position data — that lives in **Google Search Console** (a different API). This report covers the organic *behavior* GA4 owns; pair with GSC for the query side.

### `ga-client.ts` — raw report query

Thin wrapper over `runReport`. Any metrics × dimensions combo.

```bash
# Last 30 days of sessions + users (JSON)
bun run ga-client.ts --days 30 --metrics sessions,users

# Top pages by views, table output
bun run ga-client.ts --days 7 --metrics screenPageViews \
  --dimensions pagePath --order-by screenPageViews --limit 20 --format table

# Specific window, filtered by country
bun run ga-client.ts --start 2026-01-01 --end 2026-01-31 \
  --metrics sessions,bounceRate --dimensions country --filter "country:United States"
```

Flags: `--days N` | `--start --end` (YYYY-MM-DD or `NdaysAgo`/`yesterday`), `--metrics` (required, comma-sep), `--dimensions`, `--limit` (default 10), `--order-by` (prefix `-` desc / `+` asc), `--filter "field:value"`, `--format json|table`, `--output FILE`.

### `analyze.ts` — higher-level analysis + recommendations

Pre-built analyses that return metrics **plus** prioritized recommendations.

```bash
bun run analyze.ts --analysis-type seo      --days 28   # organic-only KPIs + top landing pages
bun run analyze.ts --analysis-type overview --days 30   # current vs previous period
bun run analyze.ts --analysis-type sources  --days 30   # traffic sources + optimizations
bun run analyze.ts --analysis-type content  --days 30   # high-bounce pages + diagnosis (all channels)
bun run analyze.ts --analysis-type devices  --days 30   # mobile vs desktop gap (all channels)
```

`--output FILE` writes JSON to disk instead of stdout. `--channel <name>` overrides the organic channel group for the `seo` cut.

**Which report do I actually need?** For SEO, reach for `daily-report.ts` first and `--analysis-type seo` for a quick organic snapshot. `overview` / `sources` are useful general cuts. `content` and `devices` are **all-channel** (not organic-only) and `content` keys off `bounceRate` (a de-emphasized GA4 metric) — keep them for general GA use, but for SEO the daily report's organic-filtered device/landing cuts supersede them.

> No Bun? Swap `bun run X.ts` → `npx tsx X.ts` everywhere (and `export` the env vars, since tsx won't read `.env`).

## Workflow

When the user asks an analytics question:

1. **Pick the script** — a specific metric/dimension question → `ga-client.ts`; a "how are we doing / what should we fix" question → `analyze.ts`.
2. **Run it**, capture the JSON.
3. **Interpret** — surface trends, anomalies, bottlenecks, and conversion opportunities.
4. **Recommend** — concrete actions, each with priority (HIGH/MEDIUM/LOW) and expected impact. Lead with the single highest-leverage fix.

See [EXAMPLES.md](EXAMPLES.md) for end-to-end question → command → analysis patterns, and [REFERENCE.md](REFERENCE.md) for the full metric/dimension catalog.

## Run it every day (automation)

The report is a single self-contained command, so any scheduler works. Two options:

**Plain cron** — write a dated report to a folder each morning (GA4 finalizes "yesterday" within ~24h, so an early-AM run is safe):

```bash
# crontab -e  (8:00 every day) — adjust the absolute paths
0 8 * * * cd /path/to/skills/google-analytics/scripts && \
  GOOGLE_ANALYTICS_PROPERTY_ID=123456789 \
  GOOGLE_APPLICATION_CREDENTIALS=/secure/sa.json \
  /usr/local/bin/bun run daily-report.ts --output "/reports/seo-$(date +\%F).md"
```

**Claude Code `/schedule`** — schedule an agent that runs `daily-report.ts`, then *reads* the Markdown and messages you the 2-3 highest-priority recommendations (turns the raw report into a daily briefing). Ask: "schedule a daily 8am SEO report for property 123456789 and summarize the HIGH recommendations."

Either way: one property in → one report out, every day.

## Troubleshooting

- **Auth error** — `GOOGLE_APPLICATION_CREDENTIALS` points at a valid JSON key, the service account has **Viewer** on the property, and `GOOGLE_ANALYTICS_PROPERTY_ID` is the numeric property ID (not the `G-XXXX` measurement ID).
- **No data** — verify the property ID, that the date range has data, and that access was granted in GA4. Use `yesterday` (not `today`) — today's data is incomplete.
- **Module not found** — run `bun install` (or `npm install`) inside `scripts/`.

## Security & privacy

- Credentials come from env vars / `.env` only — never hardcoded.
- The service-account JSON lives outside version control; rotate keys periodically.
- Least privilege: **Viewer** role only.
- Accesses aggregated data only — no PII, no persistence, no third-party sharing, no config writes.
