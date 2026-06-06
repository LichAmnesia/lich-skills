# Google Analytics Analysis Examples

Question → command → analysis patterns. All commands run from `skills/google-analytics/scripts/`. Swap `bun run` for `npx tsx` if you don't have Bun.

## Example 0 — SEO daily report (the out-of-the-box default) ⭐

**Ask**: "Give me a daily SEO report for property 123456789."

```bash
bun run daily-report.ts --property 123456789
# → writes seo-daily-<date>.md and prints it
```

One property in, one complete organic report out: KPIs (28d vs prior 28d), same-weekday anomaly check, organic trend, top organic landing pages, by engine/country/device, and prioritized recommendations. Then read the report and relay the HIGH items, e.g.:

```
HIGH   — /blog/ga4-seo-guide pulls 310 organic sessions but only 38.0% engagement → intent mismatch / slow load.
MEDIUM — Mobile organic engagement (55%) trails desktop (76%) by >15pp → fix mobile CWV.
LOW    — 96% of organic is Google → verify Bing Webmaster Tools coverage.
```

For a quick organic snapshot without the full template: `bun run analyze.ts --analysis-type seo --days 28`.

## Example 1 — Traffic Overview (period comparison)

**Ask**: "Review our performance for the last 30 days."

```bash
bun run analyze.ts --analysis-type overview --days 30
```

**Sample interpretation**:
```
Traffic Overview (Last 30 Days vs Previous 30 Days)

Sessions:        45,230 (+12.5%)
Active Users:    32,150 (+8.3%)
New Users:       18,920 (+15.2%)
Bounce Rate:     42.3%  (-3.1pp)
Engagement Rate: 68.5%  (+4.2pp)

Recommendations:
1. HIGH:   Investigate which channels are driving the +15.2% new-user growth — double down.
2. MEDIUM: Launch a retention campaign for existing users (sessions/user dipping).
3. LOW:    A/B-test the homepage to improve session depth.
```

## Example 2 — Traffic Sources

**Ask**: "What are our top traffic sources and which perform best?"

```bash
bun run ga-client.ts --days 30 \
  --metrics sessions,engagementRate,conversions,bounceRate \
  --dimensions sessionSource,sessionMedium \
  --order-by sessions --limit 20 --format table
# or the pre-built analysis with recommendations:
bun run analyze.ts --analysis-type sources --days 30
```

```
Source/Medium       Sessions  Eng.Rate  Conv.  Bounce
google/organic       18,240    72.3%    245    38.2%
direct/(none)        12,150    65.1%    189    45.6%
facebook/social       5,430    58.2%     67    52.3%
newsletter/email      3,210    81.5%    124    28.1%

→ HIGH: Invest in email list growth — highest engagement (81.5%), lowest bounce.
→ HIGH: Fix Facebook campaigns — high bounce, low conversion.
```

## Example 3 — Content Performance (high-bounce pages)

**Ask**: "Which pages have the highest bounce rates?"

```bash
bun run analyze.ts --analysis-type content --days 30
# or raw page list:
bun run ga-client.ts --days 30 \
  --metrics screenPageViews,bounceRate,averageSessionDuration,conversions \
  --dimensions pagePath,pageTitle --order-by screenPageViews --limit 50 --format table
```

`analyze.ts` flags pages with bounce > 60% AND >100 views, and diagnoses each:
```
/products/pricing   6,210 views  71.8% bounce  1:12 avg → "Missing CTA - users read but don't act"
/blog/getting-started 8,430 views 67.2% bounce 0:45 avg → "Content mismatch - users leave quickly"

→ HIGH: Add clear CTAs (demo / free trial) to pricing.
→ HIGH: Review getting-started keywords — traffic may be mismatched.
```

## Example 4 — Mobile vs Desktop

**Ask**: "Compare mobile and desktop performance."

```bash
bun run analyze.ts --analysis-type devices --days 30
```

```
Device   Sessions  Bounce  Avg.Time  Conv.Rate  Eng.Rate
mobile   26,140    48.5%   2:15      2.1%       64.2%
desktop  17,890    35.2%   4:32      4.8%       76.8%

→ CRITICAL: Mobile converts 56% worse than desktop — single-page mobile checkout,
            autofill, larger touch targets, mobile payment options.
```

## Example 5 — Geographic Performance

**Ask**: "Which countries should we focus on?"

```bash
bun run ga-client.ts --days 90 \
  --metrics sessions,activeUsers,conversions,totalRevenue,engagementRate \
  --dimensions country --order-by totalRevenue --limit 20 --format table
```

Look for: high-traffic / low-conversion markets (localization opportunity) and
high-engagement / low-revenue markets (pricing or payment-method gaps).

## Example 6 — Campaign Performance

**Ask**: "Which campaigns deliver the best ROI?"

```bash
bun run ga-client.ts --days 30 \
  --metrics sessions,conversions,totalRevenue,engagementRate \
  --dimensions sessionCampaignName,sessionSource,sessionMedium \
  --order-by conversions --limit 20 --format table
```

Compare conversion rate and revenue per session across campaigns; scale the
winners, narrow targeting on high-spend / low-conversion campaigns.

## Pro tips — ask better questions

| Instead of | Ask |
|---|---|
| "Show me analytics data" | "What are the top 3 issues hurting our conversion rate?" |
| "What's our bounce rate?" | "Which pages have high bounce and how do we fix them?" |
| "How many sessions last month?" | "How does last month compare to the previous month?" |
| "Show me all metrics" | "Which channels drive the most revenue?" |
| "List all problems" | "What are the top 3 improvements for this quarter?" |
