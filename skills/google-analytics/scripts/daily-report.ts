#!/usr/bin/env bun
/**
 * GA4 SEO Daily Report (TypeScript)
 *
 * Out-of-the-box, SEO-expert-curated daily report. Point it at ONE GA4 property
 * and get a complete organic-search report in Markdown — zero config beyond
 * credentials.
 *
 * Usage:
 *   bun run daily-report.ts --property 123456789
 *   bun run daily-report.ts                       # uses GOOGLE_ANALYTICS_PROPERTY_ID
 *   bun run daily-report.ts --days 28 --output report.md
 *   bun run daily-report.ts --format json
 *
 * Default template (opinionated, SEO-optimal):
 *   1. Organic KPIs — rolling 28d vs prior 28d (Search-Console-style 4-week blocks)
 *   2. Daily organic trend (anomaly scan)
 *   3. Top organic landing pages       ← the SEO money view
 *   4. Organic by search engine
 *   5. Organic by country
 *   6. Organic by device (mobile-first)
 *   7. Auto-generated, prioritized recommendations
 *
 * Note: GA4 has NO keyword/impression/CTR data — that lives in Search Console
 * (different API). This report covers the organic *behavior* side GA4 owns.
 */

import { writeFileSync } from "node:fs";
import { GoogleAnalyticsClient, type ReportResult } from "./ga-client.ts";

const ORGANIC_METRICS = [
  "sessions",
  "totalUsers",
  "newUsers",
  "engagedSessions",
  "engagementRate",
  "averageSessionDuration",
  "conversions",
];

// ---------------------------------------------------------------------------
// Small numeric / formatting helpers (all divide-by-zero guarded)
// ---------------------------------------------------------------------------

function pct(part: number, whole: number): number {
  return whole > 0 ? (part / whole) * 100 : 0;
}

function deltaPct(cur: number, prev: number): number {
  if (prev === 0) return cur === 0 ? 0 : 100;
  return ((cur - prev) / prev) * 100;
}

function arrow(d: number): string {
  if (d > 0.5) return "▲";
  if (d < -0.5) return "▼";
  return "▬";
}

function fmtDelta(d: number): string {
  const sign = d > 0 ? "+" : "";
  return `${arrow(d)} ${sign}${d.toFixed(1)}%`;
}

function fmtDuration(seconds: number): string {
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

function fmtRate01(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

function num(s: string | undefined): number {
  const n = parseFloat(s ?? "0");
  return Number.isFinite(n) ? n : 0;
}

function totals(r: ReportResult, metric: string): number {
  const idx = r.metric_headers.findIndex((m) => m.name === metric);
  if (idx < 0 || !r.totals) return 0;
  return num(r.totals[idx]?.value);
}

const EMPTY_RESULT: ReportResult = {
  dimension_headers: [],
  metric_headers: [],
  rows: [],
  row_count: 0,
  metadata: {},
};

/** Run a report but degrade to an empty result on failure, so one bad query
 *  (e.g. an unsupported dimension on this property) can't abort the whole report. */
async function safe(p: Promise<ReportResult>): Promise<ReportResult> {
  try {
    return await p;
  } catch {
    return EMPTY_RESULT;
  }
}

/** GA4 renamed the `conversions` metric to `keyEvents` (2025). Probe once and
 *  use whichever this property accepts so the report works out of the box.
 *  Only an "unsupported metric" error means swap to keyEvents — any other error
 *  (auth, permission, network) is rethrown so it surfaces instead of silently
 *  mis-resolving the metric. */
export async function resolveConversionMetric(
  client: GoogleAnalyticsClient,
): Promise<string> {
  try {
    await client.runReport({ startDate: "yesterday", endDate: "yesterday", metrics: ["conversions"], limit: 1 });
    return "conversions";
  } catch (e) {
    const msg = String(e instanceof Error ? e.message : e).toLowerCase();
    const metricUnsupported =
      /metric/.test(msg) && /(not a valid|did not match|not found|unsupported|unknown|invalid)/.test(msg);
    if (metricUnsupported) return "keyEvents";
    throw e; // auth / permission / network → surface it
  }
}

// ---------------------------------------------------------------------------
// Report data assembly
// ---------------------------------------------------------------------------

interface Rec {
  priority: "HIGH" | "MEDIUM" | "LOW";
  text: string;
}

export interface DailyReport {
  property: string;
  generated_at: string;
  window_days: number;
  channel: string;
  kpis: Record<
    string,
    { current: number; previous: number; change_percent: number }
  >;
  organic_share_of_total_pct: number;
  anomaly: {
    yesterday_sessions: number;
    same_day_last_week_sessions: number;
    change_percent: number;
    flagged: boolean;
  };
  trend: { date: string; sessions: number }[];
  landing_pages: {
    page: string;
    sessions: number;
    engagement_rate: number;
    conversions: number;
  }[];
  search_engines: { source: string; sessions: number; engagement_rate: number }[];
  countries: { country: string; sessions: number; engagement_rate: number }[];
  devices: {
    device: string;
    sessions: number;
    engagement_rate: number;
    avg_duration: number;
  }[];
  recommendations: Rec[];
}

export async function buildReport(
  client: GoogleAnalyticsClient,
  property: string,
  windowDays: number,
  channel: string,
  anomalyThreshold: number,
): Promise<DailyReport> {
  const N = windowDays;
  const organicFilter = `sessionDefaultChannelGroup:${channel}`;
  const cur: [string, string] = [`${N}daysAgo`, "yesterday"];
  // Prior, non-overlapping window of equal length, ending the day before `cur` starts.
  const prev: [string, string] = [`${2 * N}daysAgo`, `${N + 1}daysAgo`];
  // Same weekday last week = yesterday (1 day ago) minus 7 days = 8 days ago.
  const SAME_DAY_LAST_WEEK = "8daysAgo";

  // GA4 `conversions` vs `keyEvents` — resolve which this property accepts.
  const CONV = await resolveConversionMetric(client);
  // Logical order matches ORGANIC_METRICS; the conversion slot uses the resolved name.
  const kpiMetrics = ["sessions", "totalUsers", "newUsers", "engagedSessions", "engagementRate", "averageSessionDuration", CONV];

  // Fire the independent queries together; each degrades to empty on failure.
  const [
    kpiCur,
    kpiPrev,
    totalCur,
    landing,
    engines,
    countries,
    devices,
    trend,
    ydayOrganic,
    lastWeekOrganic,
  ] = await Promise.all([
    // kpiCur is foundational and NOT safe()-wrapped: if it throws (auth / permission /
    // bad property), the error must surface and exit 1 — not masquerade as a clean
    // "no data" report. kpiCur alone guarantees auth-surfacing (a real permission
    // failure hits every query). Everything else — including the cosmetic share
    // denominator (totalCur) — is wrapped so one bad query can't abort a valid report.
    client.runReport({ startDate: cur[0], endDate: cur[1], metrics: kpiMetrics, limit: 1, filterExpression: organicFilter }),
    safe(client.runReport({ startDate: prev[0], endDate: prev[1], metrics: kpiMetrics, limit: 1, filterExpression: organicFilter })),
    safe(client.runReport({ startDate: cur[0], endDate: cur[1], metrics: ["sessions"], limit: 1 })),
    safe(client.runReport({ startDate: cur[0], endDate: cur[1], metrics: ["sessions", "engagementRate", CONV], dimensions: ["landingPage"], orderBy: "-sessions", limit: 15, filterExpression: organicFilter })),
    safe(client.runReport({ startDate: cur[0], endDate: cur[1], metrics: ["sessions", "engagementRate"], dimensions: ["sessionSource"], orderBy: "-sessions", limit: 8, filterExpression: organicFilter })),
    safe(client.runReport({ startDate: cur[0], endDate: cur[1], metrics: ["sessions", "engagementRate"], dimensions: ["country"], orderBy: "-sessions", limit: 8, filterExpression: organicFilter })),
    safe(client.runReport({ startDate: cur[0], endDate: cur[1], metrics: ["sessions", "engagementRate", "averageSessionDuration"], dimensions: ["deviceCategory"], orderBy: "-sessions", limit: 5, filterExpression: organicFilter })),
    safe(client.runReport({ startDate: cur[0], endDate: cur[1], metrics: ["sessions"], dimensions: ["date"], orderBy: "+date", limit: N, filterExpression: organicFilter })),
    safe(client.runReport({ startDate: "yesterday", endDate: "yesterday", metrics: ["sessions"], limit: 1, filterExpression: organicFilter })),
    safe(client.runReport({ startDate: SAME_DAY_LAST_WEEK, endDate: SAME_DAY_LAST_WEEK, metrics: ["sessions"], limit: 1, filterExpression: organicFilter })),
  ]);

  // Map actual metric names back to logical keys (conversion slot → "conversions").
  const actualName = (logical: string) => (logical === "conversions" ? CONV : logical);
  const kpis: DailyReport["kpis"] = {};
  for (const m of ORGANIC_METRICS) {
    const c = totals(kpiCur, actualName(m));
    const p = totals(kpiPrev, actualName(m));
    kpis[m] = { current: c, previous: p, change_percent: Math.round(deltaPct(c, p) * 10) / 10 };
  }

  const organicSessions = totals(kpiCur, "sessions");
  const totalSessions = totals(totalCur, "sessions");
  const organicShare = Math.round(pct(organicSessions, totalSessions) * 10) / 10;

  const yday = totals(ydayOrganic, "sessions");
  const lastWeek = totals(lastWeekOrganic, "sessions");
  const ydayDelta = Math.round(deltaPct(yday, lastWeek) * 10) / 10;

  const report: DailyReport = {
    property,
    generated_at: new Date().toISOString(),
    window_days: N,
    channel,
    kpis,
    organic_share_of_total_pct: organicShare,
    anomaly: {
      yesterday_sessions: yday,
      same_day_last_week_sessions: lastWeek,
      change_percent: ydayDelta,
      flagged: ydayDelta <= -anomalyThreshold,
    },
    trend: trend.rows.map((r) => ({ date: r.dimensions.date, sessions: num(r.metrics.sessions) })),
    landing_pages: landing.rows.map((r) => ({
      page: r.dimensions.landingPage,
      sessions: num(r.metrics.sessions),
      engagement_rate: num(r.metrics.engagementRate),
      conversions: num(r.metrics[CONV]),
    })),
    search_engines: engines.rows.map((r) => ({
      source: r.dimensions.sessionSource,
      sessions: num(r.metrics.sessions),
      engagement_rate: num(r.metrics.engagementRate),
    })),
    countries: countries.rows.map((r) => ({
      country: r.dimensions.country,
      sessions: num(r.metrics.sessions),
      engagement_rate: num(r.metrics.engagementRate),
    })),
    devices: devices.rows.map((r) => ({
      device: r.dimensions.deviceCategory,
      sessions: num(r.metrics.sessions),
      engagement_rate: num(r.metrics.engagementRate),
      avg_duration: num(r.metrics.averageSessionDuration),
    })),
    recommendations: [],
  };

  report.recommendations = recommend(report);
  return report;
}

// ---------------------------------------------------------------------------
// Recommendation engine — every rec ties to a real number in the report
// ---------------------------------------------------------------------------

export function recommend(r: DailyReport): Rec[] {
  const recs: Rec[] = [];
  const sess = r.kpis.sessions;
  const conv = r.kpis.conversions;

  // 1. Anomaly — yesterday vs same weekday last week.
  if (r.anomaly.flagged) {
    recs.push({
      priority: "HIGH",
      text: `Organic sessions yesterday (${r.anomaly.yesterday_sessions}) fell ${Math.abs(r.anomaly.change_percent)}% vs the same weekday last week (${r.anomaly.same_day_last_week_sessions}). Check for deindexing, a broken deploy, tracking/tag breakage, or a Google update.`,
    });
  }

  // 2. Window trend.
  if (sess.change_percent <= -10) {
    recs.push({
      priority: "HIGH",
      text: `Organic sessions down ${Math.abs(sess.change_percent)}% over the last ${r.window_days}d vs the prior period. Audit top landing pages for ranking loss and check Search Console for impression/position drops.`,
    });
  } else if (sess.change_percent >= 10) {
    recs.push({
      priority: "LOW",
      text: `Organic sessions up ${sess.change_percent}% — identify which landing pages drove the lift and double down (more depth, internal links, refreshed content).`,
    });
  }

  // 3. Conversions materially underperforming traffic — intent / CTA gap.
  //    Fires whether sessions rose or fell, as long as conversions lag traffic by >10pp.
  if (conv.previous > 0 && conv.change_percent - sess.change_percent < -10) {
    const framing =
      sess.change_percent >= 0
        ? `Organic traffic is ${fmtDelta(sess.change_percent)} but conversions ${fmtDelta(conv.change_percent)}`
        : `Organic conversions (${fmtDelta(conv.change_percent)}) are falling faster than traffic (${fmtDelta(sess.change_percent)})`;
    recs.push({
      priority: "MEDIUM",
      text: `${framing}. New/remaining traffic may be lower-intent or landing pages lack a clear CTA — review query intent vs page offer and conversion path.`,
    });
  }

  // 4. High-traffic, low-engagement landing pages.
  const weak = r.landing_pages
    .slice(0, 8)
    .filter((p) => p.engagement_rate < 0.45 && p.sessions >= 50);
  for (const p of weak.slice(0, 3)) {
    recs.push({
      priority: "HIGH",
      text: `Landing page ${p.page} pulls ${p.sessions} organic sessions but only ${fmtRate01(p.engagement_rate)} engagement — likely intent mismatch or slow load. Tighten title/H1 to match query and improve above-the-fold + Core Web Vitals.`,
    });
  }

  // 5. Mobile vs desktop engagement gap (mobile-first indexing).
  const mob = r.devices.find((d) => d.device === "mobile");
  const desk = r.devices.find((d) => d.device === "desktop");
  if (mob && desk && desk.engagement_rate - mob.engagement_rate > 0.15) {
    recs.push({
      priority: "MEDIUM",
      text: `Mobile organic engagement (${fmtRate01(mob.engagement_rate)}) trails desktop (${fmtRate01(desk.engagement_rate)}) by >15pp. Google indexes mobile-first — fix mobile CWV, tap targets, and layout shift.`,
    });
  }

  // 6. Search-engine concentration.
  const totalEngine = r.search_engines.reduce((a, b) => a + b.sessions, 0);
  const google = r.search_engines.find((e) => /google/i.test(e.source));
  if (google && totalEngine > 0 && pct(google.sessions, totalEngine) > 95) {
    recs.push({
      priority: "LOW",
      text: `${Math.round(pct(google.sessions, totalEngine))}% of organic comes from Google — a single-point dependency. Verify Bing Webmaster Tools coverage and test surfacing in other engines/AI answer boxes.`,
    });
  }

  if (recs.length === 0) {
    recs.push({
      priority: "LOW",
      text: `No red flags this period — organic sessions ${fmtDelta(sess.change_percent)}, engagement ${fmtRate01(r.kpis.engagementRate.current)}. Keep shipping content and monitoring landing-page rankings.`,
    });
  }

  return recs;
}

// ---------------------------------------------------------------------------
// Markdown rendering
// ---------------------------------------------------------------------------

function sparkline(values: number[]): string {
  if (values.length === 0) return "";
  const bars = "▁▂▃▄▅▆▇█";
  const max = Math.max(...values, 1);
  return values.map((v) => bars[Math.min(bars.length - 1, Math.floor((v / max) * (bars.length - 1)))]).join("");
}

export function renderMarkdown(r: DailyReport): string {
  const out: string[] = [];
  const KPI_LABEL: Record<string, string> = {
    sessions: "Organic sessions",
    totalUsers: "Organic users",
    newUsers: "New users",
    engagedSessions: "Engaged sessions",
    engagementRate: "Engagement rate",
    averageSessionDuration: "Avg. engagement time",
    conversions: "Conversions",
  };

  out.push(`# SEO Daily Report — property ${r.property}`);
  out.push("");
  out.push(`_Generated ${r.generated_at} · channel: ${r.channel} · window: last ${r.window_days}d vs prior ${r.window_days}d_`);
  out.push("");

  if (r.kpis.sessions.current === 0) {
    out.push(`> ⚠️ No **${r.channel}** sessions in the last ${r.window_days} days for this property. Check the channel name (\`--channel\`), the property ID, and that organic traffic exists.`);
    out.push("");
    out.push("## Recommendations");
    for (const rec of r.recommendations) out.push(`- **${rec.priority}** — ${rec.text}`);
    return out.join("\n");
  }

  // KPIs
  out.push("## Organic KPIs");
  out.push("");
  out.push("| Metric | Current | Previous | Change |");
  out.push("|---|--:|--:|--:|");
  for (const m of ORGANIC_METRICS) {
    const k = r.kpis[m];
    const isRate = m === "engagementRate";
    const isDur = m === "averageSessionDuration";
    const fmt = (v: number) => (isRate ? fmtRate01(v) : isDur ? fmtDuration(v) : Math.round(v).toLocaleString());
    out.push(`| ${KPI_LABEL[m]} | ${fmt(k.current)} | ${fmt(k.previous)} | ${fmtDelta(k.change_percent)} |`);
  }
  out.push("");
  out.push(`Organic = **${r.organic_share_of_total_pct}%** of all sessions this window.`);
  out.push("");

  // Anomaly
  out.push("## Daily anomaly check (yesterday vs same weekday last week)");
  out.push("");
  const a = r.anomaly;
  const flag = a.flagged ? "🚨 **FLAGGED**" : "✅ normal";
  out.push(`Yesterday: **${a.yesterday_sessions}** organic sessions · last week same day: **${a.same_day_last_week_sessions}** · ${fmtDelta(a.change_percent)} — ${flag}`);
  out.push("");

  // Trend
  if (r.trend.length > 0) {
    out.push("## Organic trend");
    out.push("");
    out.push("```");
    out.push(`${sparkline(r.trend.map((t) => t.sessions))}  (daily organic sessions, ${r.trend.length}d)`);
    out.push("```");
    out.push("");
  }

  // Landing pages
  if (r.landing_pages.length > 0) {
    out.push("## Top organic landing pages");
    out.push("");
    out.push("| Landing page | Sessions | Engagement | Conversions |");
    out.push("|---|--:|--:|--:|");
    for (const p of r.landing_pages.slice(0, 12)) {
      out.push(`| ${p.page} | ${p.sessions.toLocaleString()} | ${fmtRate01(p.engagement_rate)} | ${Math.round(p.conversions)} |`);
    }
    out.push("");
  }

  // Search engines
  if (r.search_engines.length > 0) {
    out.push("## Organic by search engine");
    out.push("");
    out.push("| Source | Sessions | Engagement |");
    out.push("|---|--:|--:|");
    for (const e of r.search_engines) out.push(`| ${e.source} | ${e.sessions.toLocaleString()} | ${fmtRate01(e.engagement_rate)} |`);
    out.push("");
  }

  // Countries
  if (r.countries.length > 0) {
    out.push("## Organic by country");
    out.push("");
    out.push("| Country | Sessions | Engagement |");
    out.push("|---|--:|--:|");
    for (const c of r.countries) out.push(`| ${c.country} | ${c.sessions.toLocaleString()} | ${fmtRate01(c.engagement_rate)} |`);
    out.push("");
  }

  // Devices
  if (r.devices.length > 0) {
    out.push("## Organic by device");
    out.push("");
    out.push("| Device | Sessions | Engagement | Avg. time |");
    out.push("|---|--:|--:|--:|");
    for (const d of r.devices) out.push(`| ${d.device} | ${d.sessions.toLocaleString()} | ${fmtRate01(d.engagement_rate)} | ${fmtDuration(d.avg_duration)} |`);
    out.push("");
  }

  // Recommendations
  out.push("## Recommendations");
  out.push("");
  const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  for (const rec of [...r.recommendations].sort((x, y) => order[x.priority] - order[y.priority])) {
    out.push(`- **${rec.priority}** — ${rec.text}`);
  }
  out.push("");
  out.push("---");
  out.push("_GA4 covers organic behavior only. For keywords, impressions, CTR, and average position, pair with Google Search Console._");

  return out.join("\n");
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

interface Args {
  property?: string;
  days: number;
  channel: string;
  anomalyThreshold: number;
  format: "md" | "json";
  output?: string;
}

const USAGE = `GA4 SEO Daily Report

Usage: daily-report.ts [options]

  --property <id>            GA4 property ID (else GOOGLE_ANALYTICS_PROPERTY_ID)
  --days <n>                 Rolling window length, default 28 (Search-Console 4-week block)
  --channel <name>           Channel-group value, default "Organic Search"
  --anomaly-threshold <pct>  Flag yesterday-vs-last-week drop ≥ this %, default 25
  --format <md|json>         Output format, default md
  --output <file>            Output path, default seo-daily-<date>.{md,json}
  --help                     Show this help

Requires GOOGLE_APPLICATION_CREDENTIALS pointing at a service-account JSON.`;

function intArg(raw: string, flag: string): number {
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n)) {
    console.error(`Error: ${flag} expects a number, got "${raw}".`);
    process.exit(1);
  }
  return n;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { days: 28, channel: "Organic Search", anomalyThreshold: 25, format: "md" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case "--help":
      case "-h":
        console.log(USAGE);
        process.exit(0);
        break;
      case "--property": args.property = next(); break;
      case "--days": args.days = intArg(next(), "--days"); break;
      case "--channel": args.channel = next(); break;
      case "--anomaly-threshold": args.anomalyThreshold = intArg(next(), "--anomaly-threshold"); break;
      case "--format": args.format = next() as Args["format"]; break;
      case "--output": args.output = next(); break;
      default:
        console.error(`Unknown argument: ${a}`);
        process.exit(1);
    }
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  try {
    const client = new GoogleAnalyticsClient(args.property);
    const property = args.property ?? process.env.GOOGLE_ANALYTICS_PROPERTY_ID ?? "unknown";

    const report = await buildReport(client, property, args.days, args.channel, args.anomalyThreshold);

    const rendered = args.format === "json" ? JSON.stringify(report, null, 2) : renderMarkdown(report);
    const date = report.generated_at.slice(0, 10);
    const outPath = args.output ?? (args.format === "json" ? `seo-daily-${date}.json` : `seo-daily-${date}.md`);

    writeFileSync(outPath, rendered);
    console.error(`SEO daily report written to ${outPath}`);
    // Also echo to stdout so it's usable in a pipe / agent context.
    console.log(rendered);
  } catch (e) {
    console.error(`Error: ${e instanceof Error ? e.message : e}`);
    process.exit(1);
  }
}

if ((import.meta as any).main ?? process.argv[1]?.endsWith("daily-report.ts")) {
  main();
}
