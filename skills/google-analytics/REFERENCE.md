# Google Analytics 4 Metrics Reference

Complete reference for GA4 metrics and dimensions used by this skill.

## Core Metrics

### User Metrics

| Metric | Description | Use Case |
|--------|-------------|----------|
| `activeUsers` | Users who engaged with your site or app | Overall audience size |
| `newUsers` | First-time users | Growth tracking |
| `totalUsers` | Total number of users | Audience reach |
| `userEngagementDuration` | Total time users spent engaged | Content quality |
| `engagedSessions` | Sessions >10s with conversion or 2+ page views | Quality sessions |

### Session Metrics

| Metric | Description | Use Case |
|--------|-------------|----------|
| `sessions` | Total number of sessions | Traffic volume |
| `sessionsPerUser` | Average sessions per user | User retention |
| `averageSessionDuration` | Mean session length | Engagement depth |
| `bounceRate` | Percentage of single-page sessions | Content relevance |
| `engagementRate` | Percentage of engaged sessions | Quality of traffic |

### Page / Screen Metrics

| Metric | Description | Use Case |
|--------|-------------|----------|
| `screenPageViews` | Total page and screen views | Content consumption |
| `screenPageViewsPerSession` | Average pages per session | Site exploration |
| `screenPageViewsPerUser` | Average pages per user | User journey depth |

### Event Metrics

| Metric | Description | Use Case |
|--------|-------------|----------|
| `eventCount` | Total number of events | Interaction tracking |
| `eventCountPerUser` | Average events per user | User activity level |
| `conversions` | Total conversion events (GA4 renamed this to `keyEvents` in 2025; newer properties may require `keyEvents`) | Goal achievement |
| `keyEvents` | 2025+ name for `conversions` | Goal achievement |
| `totalRevenue` | Total revenue from all sources | Monetization |

### E-commerce Metrics

| Metric | Description | Use Case |
|--------|-------------|----------|
| `transactions` | Number of purchases | Sales volume |
| `purchaseRevenue` | Revenue from purchases | Sales performance |
| `averagePurchaseRevenue` | Average transaction value | Revenue per sale |
| `itemsViewed` | Product detail views | Product interest |
| `addToCarts` | Items added to cart | Purchase intent |
| `checkouts` | Checkout initiations | Conversion funnel |

## Key Dimensions

### Traffic Source

| Dimension | Description | Example Values |
|-----------|-------------|----------------|
| `sessionSource` | Source of traffic | google, facebook, direct |
| `sessionMedium` | Marketing medium | organic, cpc, referral, email |
| `sessionCampaignName` | Campaign identifier | spring-sale, black-friday |
| `sessionDefaultChannelGroup` | Channel grouping (SEO filters on `Organic Search`) | Organic Search, Paid Social, Direct |
| `firstUserSource` | Source of user's first visit | google, twitter, newsletter |

### Content

| Dimension | Description | Example Values |
|-----------|-------------|----------------|
| `pagePath` | Page URL path | /blog/post-title, /products/item |
| `pageTitle` | Page title | Home, Product Page, Blog Post |
| `pageLocation` | Full page URL | https://example.com/page |
| `landingPage` | First page of session | /home, /blog/article |

### User

| Dimension | Description | Example Values |
|-----------|-------------|----------------|
| `country` | User country | United States, United Kingdom |
| `city` | User city | New York, London, Tokyo |
| `deviceCategory` | Device type | mobile, desktop, tablet |
| `browser` | Browser name | Chrome, Safari, Firefox |
| `operatingSystem` | OS name | Windows, macOS, Android, iOS |

### Time

| Dimension | Description | Example Values |
|-----------|-------------|----------------|
| `date` | Date (YYYYMMDD) | 20260118 |
| `year` | Year | 2026 |
| `month` | Month | 01, 02, 03 |
| `dayOfWeek` | Day of week | Sunday, Monday |
| `hour` | Hour of day | 00-23 |

## Common Metric Combinations

```ts
// Traffic analysis
metrics    = ["sessions", "activeUsers", "newUsers", "engagementRate", "bounceRate"];
dimensions = ["sessionSource", "sessionMedium"];

// Content performance
metrics    = ["screenPageViews", "averageSessionDuration", "bounceRate", "eventCount"];
dimensions = ["pagePath", "pageTitle"];

// User behavior
metrics    = ["activeUsers", "sessionsPerUser", "screenPageViewsPerSession", "userEngagementDuration"];
dimensions = ["deviceCategory", "country"];

// Conversion tracking
metrics    = ["conversions", "sessions", "eventCount", "engagementRate"];
dimensions = ["sessionSource", "sessionMedium", "sessionCampaignName"];

// E-commerce
metrics    = ["transactions", "purchaseRevenue", "averagePurchaseRevenue", "itemsViewed", "addToCarts"];
dimensions = ["sessionSource", "deviceCategory"];
```

## Date Range Formats

**Relative**: `today`, `yesterday`, `7daysAgo`, `30daysAgo`, `90daysAgo`
**Absolute**: `YYYY-MM-DD` (e.g. `2026-01-01` to `2026-01-31`)

```text
Last 7 days     → start 7daysAgo  / end yesterday
Last 30 days    → start 30daysAgo / end yesterday
Month-to-date   → start 2026-01-01 / end today
Compare prev.   → current 30daysAgo→yesterday  vs  previous 60daysAgo→31daysAgo
```

## Filters (in `ga-client.ts`)

The CLI `--filter "field:value"` does an exact dimension string match, e.g.:

```bash
--filter "pagePath:/blog"
--filter "country:United States"
--filter "sessionSource:google"
```

For richer filters (BEGINS_WITH / CONTAINS / REGEX / numeric), build the request
object directly with `GoogleAnalyticsClient.runReport` — the underlying
`@google-analytics/data` request supports the full `dimensionFilter` /
`metricFilter` shape.

| Operator | Description |
|----------|-------------|
| `EXACT` | Exact match |
| `BEGINS_WITH` | Starts with |
| `ENDS_WITH` | Ends with |
| `CONTAINS` | Contains substring |
| `REGEX` | Regular expression |

## Order By

`--order-by sessions` (desc by default), `--order-by +pagePath` (asc), `--order-by -bounceRate` (explicit desc).

## Parsed Response Structure

`ga-client.ts` normalizes the API response into:

```jsonc
{
  "dimension_headers": ["sessionSource", "sessionMedium"],
  "metric_headers": [
    { "name": "sessions",   "type": "TYPE_INTEGER" },
    { "name": "bounceRate", "type": "TYPE_FLOAT" }
  ],
  "rows": [
    {
      "dimensions": { "sessionSource": "google", "sessionMedium": "organic" },
      "metrics":    { "sessions": "1250", "bounceRate": "0.45" }
    }
  ],
  "row_count": 1,
  "totals": [{ "value": "1250" }],
  "metadata": {}
}
```

## Common Calculations

```text
conversion_rate   = (conversions / sessions) * 100
average_order_val = purchaseRevenue / transactions
pages_per_session = screenPageViews / sessions
engagement_rate   = (engagedSessions / sessions) * 100
revenue_per_user  = totalRevenue / activeUsers
```

## Best Practices

- Request only the metrics/dimensions you need; cap rows with `--limit` (API max 100,000).
- Allow 24–48h for processing; use `yesterday`, not `today`.
- Compare periods for context (WoW, MoM); segment by device/source/location.
- Watch for sampling on large datasets.

## Resources

- [GA4 Dimensions & Metrics Explorer](https://ga-dev-tools.google/ga4/dimensions-metrics-explorer/)
- [GA4 Data API Reference](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [GA4 Query Explorer](https://ga-dev-tools.google/ga4/query-explorer/)
- [`@google-analytics/data` npm](https://www.npmjs.com/package/@google-analytics/data)
