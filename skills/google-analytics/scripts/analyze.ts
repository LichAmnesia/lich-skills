#!/usr/bin/env bun
/**
 * Google Analytics Data Analysis Tool (TypeScript)
 *
 * Higher-level analysis on top of ga-client.ts:
 *   - Period comparisons (current vs previous)
 *   - Traffic-source performance + optimization recommendations
 *   - Content (page) performance + high-bounce diagnosis
 *   - Device comparison (mobile vs desktop)
 *
 * Usage:
 *   bun run analyze.ts --analysis-type overview --days 30 --compare
 *   bun run analyze.ts --analysis-type sources --days 30
 *   bun run analyze.ts --analysis-type content --days 30
 *   bun run analyze.ts --analysis-type devices --days 30
 */

import { writeFileSync } from "node:fs";
import { GoogleAnalyticsClient } from "./ga-client.ts";

interface Recommendation {
  priority: string;
  action: string;
  reason: string;
  expected_impact?: string;
}

export class AnalyticsAnalyzer {
  private client: GoogleAnalyticsClient;

  constructor() {
    this.client = new GoogleAnalyticsClient();
  }

  async comparePeriods(currentDays = 30, metrics?: string[]) {
    const m = metrics ?? [
      "sessions",
      "activeUsers",
      "newUsers",
      "bounceRate",
      "engagementRate",
      "averageSessionDuration",
    ];

    const current = await this.client.runReport({
      startDate: `${currentDays}daysAgo`,
      endDate: "yesterday",
      metrics: m,
      limit: 1,
    });

    const previousStart = currentDays * 2;
    const previousEnd = currentDays + 1;
    const previous = await this.client.runReport({
      startDate: `${previousStart}daysAgo`,
      endDate: `${previousEnd}daysAgo`,
      metrics: m,
      limit: 1,
    });

    const comparison: any = {
      current_period: `Last ${currentDays} days`,
      previous_period: `Previous ${currentDays} days`,
      metrics: {} as Record<string, unknown>,
    };

    if (current.totals && previous.totals) {
      m.forEach((metric, i) => {
        const cur = parseFloat(current.totals![i].value);
        const prev = parseFloat(previous.totals![i].value);
        const changePct = prev !== 0 ? ((cur - prev) / prev) * 100 : 0;
        comparison.metrics[metric] = {
          current: cur,
          previous: prev,
          change: cur - prev,
          change_percent: Math.round(changePct * 100) / 100,
        };
      });
    }

    comparison.insights = this.generateInsights(comparison.metrics);
    return comparison;
  }

  async analyzeTrafficSources(days = 30, limit = 20) {
    const result = await this.client.runReport({
      startDate: `${days}daysAgo`,
      endDate: "yesterday",
      metrics: ["sessions", "engagementRate", "bounceRate", "conversions"],
      dimensions: ["sessionSource", "sessionMedium"],
      limit,
      orderBy: "-sessions",
    });

    const sources = result.rows.map((row) => {
      const sessions = parseInt(row.metrics.sessions, 10);
      const engagement = parseFloat(row.metrics.engagementRate);
      const bounce = parseFloat(row.metrics.bounceRate);
      const conversions = parseInt(row.metrics.conversions ?? "0", 10) || 0;
      const convRate = sessions > 0 ? (conversions / sessions) * 100 : 0;
      return {
        source: row.dimensions.sessionSource,
        medium: row.dimensions.sessionMedium,
        sessions,
        engagement_rate: Math.round(engagement * 100 * 100) / 100,
        bounce_rate: Math.round(bounce * 100 * 100) / 100,
        conversions,
        conversion_rate: Math.round(convRate * 100) / 100,
      };
    });

    return {
      period: `Last ${days} days`,
      sources,
      recommendations: this.recommendSourceOptimizations(sources),
    };
  }

  async analyzeContentPerformance(days = 30, limit = 50) {
    const result = await this.client.runReport({
      startDate: `${days}daysAgo`,
      endDate: "yesterday",
      metrics: [
        "screenPageViews",
        "bounceRate",
        "averageSessionDuration",
        "conversions",
      ],
      dimensions: ["pagePath", "pageTitle"],
      limit,
      orderBy: "-screenPageViews",
    });

    const highBounceThreshold = 0.6;
    const problemPages = [] as any[];

    for (const row of result.rows) {
      const views = parseInt(row.metrics.screenPageViews, 10);
      const bounce = parseFloat(row.metrics.bounceRate);
      const avgDuration = parseFloat(row.metrics.averageSessionDuration);
      if (bounce > highBounceThreshold && views > 100) {
        problemPages.push({
          path: row.dimensions.pagePath,
          title: row.dimensions.pageTitle,
          views,
          bounce_rate: Math.round(bounce * 100 * 100) / 100,
          avg_duration: Math.round(avgDuration * 100) / 100,
          issue: this.diagnosePageIssue(bounce, avgDuration),
        });
      }
    }

    return {
      period: `Last ${days} days`,
      total_pages: result.row_count,
      high_bounce_pages: problemPages.length,
      problem_pages: problemPages.slice(0, 10),
      recommendations: this.recommendContentImprovements(problemPages),
    };
  }

  /**
   * Organic-search-only quick cut for SEO: KPIs + top landing pages.
   * Filters to the Organic Search default channel group. For the full daily
   * report use daily-report.ts.
   */
  async analyzeSeo(days = 28, channel = "Organic Search", limit = 15) {
    const organicFilter = `sessionDefaultChannelGroup:${channel}`;

    const kpi = await this.client.runReport({
      startDate: `${days}daysAgo`,
      endDate: "yesterday",
      metrics: ["sessions", "totalUsers", "newUsers", "engagementRate", "conversions"],
      limit: 1,
      filterExpression: organicFilter,
    });

    const landing = await this.client.runReport({
      startDate: `${days}daysAgo`,
      endDate: "yesterday",
      metrics: ["sessions", "engagementRate", "conversions"],
      dimensions: ["landingPage"],
      orderBy: "-sessions",
      limit,
      filterExpression: organicFilter,
    });

    const tot = (m: string) => {
      const i = kpi.metric_headers.findIndex((h) => h.name === m);
      return i >= 0 && kpi.totals ? parseFloat(kpi.totals[i].value) : 0;
    };

    return {
      period: `Last ${days} days`,
      channel,
      kpis: {
        sessions: tot("sessions"),
        users: tot("totalUsers"),
        new_users: tot("newUsers"),
        engagement_rate: Math.round(tot("engagementRate") * 100 * 100) / 100,
        conversions: tot("conversions"),
      },
      top_landing_pages: landing.rows.map((r) => ({
        page: r.dimensions.landingPage,
        sessions: parseInt(r.metrics.sessions, 10),
        engagement_rate: Math.round(parseFloat(r.metrics.engagementRate) * 100 * 100) / 100,
        conversions: parseInt(r.metrics.conversions ?? "0", 10) || 0,
      })),
    };
  }

  async analyzeDevicePerformance(days = 30) {
    const result = await this.client.runReport({
      startDate: `${days}daysAgo`,
      endDate: "yesterday",
      metrics: [
        "sessions",
        "bounceRate",
        "averageSessionDuration",
        "conversions",
        "engagementRate",
      ],
      dimensions: ["deviceCategory"],
      limit: 10,
      orderBy: "-sessions",
    });

    const devices = result.rows.map((row) => {
      const sessions = parseInt(row.metrics.sessions, 10);
      const bounce = parseFloat(row.metrics.bounceRate);
      const duration = parseFloat(row.metrics.averageSessionDuration);
      const conversions = parseInt(row.metrics.conversions ?? "0", 10) || 0;
      const engagement = parseFloat(row.metrics.engagementRate);
      const convRate = sessions > 0 ? (conversions / sessions) * 100 : 0;
      return {
        device: row.dimensions.deviceCategory,
        sessions,
        bounce_rate: Math.round(bounce * 100 * 100) / 100,
        avg_duration: Math.round(duration * 100) / 100,
        conversion_rate: Math.round(convRate * 100) / 100,
        engagement_rate: Math.round(engagement * 100 * 100) / 100,
      };
    });

    return {
      period: `Last ${days} days`,
      devices,
      recommendations: this.recommendDeviceOptimizations(devices),
    };
  }

  // --- insight / recommendation engines -----------------------------------

  private generateInsights(metrics: Record<string, any>): string[] {
    const insights: string[] = [];
    for (const [metric, data] of Object.entries(metrics)) {
      const changePct = data.change_percent as number;
      if (Math.abs(changePct) >= 5) {
        const direction = changePct > 0 ? "increased" : "decreased";
        const title = metric
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        insights.push(
          `${title}: ${direction} by ${Math.abs(changePct).toFixed(1)}%`,
        );
      }
    }
    return insights;
  }

  private recommendSourceOptimizations(sources: any[]): Recommendation[] {
    const recs: Recommendation[] = [];
    if (sources.length === 0) return recs;

    const best = sources.reduce((a, b) =>
      b.conversion_rate > a.conversion_rate ? b : a,
    );
    recs.push({
      priority: "HIGH",
      action: `Scale ${best.source}/${best.medium}`,
      reason: `Highest conversion rate (${best.conversion_rate}%)`,
      expected_impact: "Increase overall conversions by 20-30%",
    });

    for (const s of sources.slice(0, 5)) {
      if (s.conversion_rate < 2.0 && s.sessions > 1000) {
        recs.push({
          priority: "MEDIUM",
          action: `Optimize ${s.source}/${s.medium}`,
          reason: `High traffic (${s.sessions} sessions) but low conversion (${s.conversion_rate}%)`,
          expected_impact: "Potential conversion rate improvement of 50-100%",
        });
      }
    }
    return recs;
  }

  private recommendContentImprovements(problemPages: any[]): Recommendation[] {
    if (problemPages.length === 0) {
      return [
        {
          priority: "INFO",
          action: "Content performing well",
          reason: "No pages with critically high bounce rates",
          expected_impact: "Continue monitoring",
        },
      ];
    }
    const sorted = [...problemPages].sort((a, b) => b.views - a.views);
    return sorted.slice(0, 3).map((page) => ({
      priority: "HIGH",
      action: `Improve ${page.path}`,
      reason: `${page.issue} (${page.bounce_rate}% bounce rate)`,
      expected_impact: "Reduce bounce rate by 20-30%",
    }));
  }

  private recommendDeviceOptimizations(devices: any[]): Recommendation[] {
    const recs: Recommendation[] = [];
    if (devices.length < 2) return recs;

    const mobile = devices.find((d) => d.device === "mobile");
    const desktop = devices.find((d) => d.device === "desktop");
    if (mobile && desktop && desktop.conversion_rate > 0) {
      const convDiff =
        ((desktop.conversion_rate - mobile.conversion_rate) /
          desktop.conversion_rate) *
        100;
      if (convDiff > 30) {
        recs.push({
          priority: "CRITICAL",
          action: "Mobile experience optimization",
          reason: `Mobile conversion rate ${mobile.conversion_rate}% vs desktop ${desktop.conversion_rate}%`,
          expected_impact: "Improve mobile conversion by 30-50%",
        });
      }
    }
    return recs;
  }

  private diagnosePageIssue(bounceRate: number, avgDuration: number): string {
    if (bounceRate > 0.7 && avgDuration < 30)
      return "Content mismatch - users leave quickly";
    if (bounceRate > 0.6 && avgDuration > 60)
      return "Missing CTA - users read but don't act";
    if (bounceRate > 0.6) return "High bounce - needs investigation";
    return "Performance issue";
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

interface Args {
  analysisType: "overview" | "sources" | "content" | "devices" | "seo";
  days: number;
  channel: string;
  compare: boolean;
  output?: string;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { analysisType: "overview", days: 30, channel: "Organic Search", compare: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case "--analysis-type":
        args.analysisType = next() as Args["analysisType"];
        break;
      case "--days": {
        const n = parseInt(next(), 10);
        if (!Number.isFinite(n)) {
          console.error('Error: --days expects a number.');
          process.exit(1);
        }
        args.days = n;
        break;
      }
      case "--channel":
        args.channel = next();
        break;
      case "--compare":
        args.compare = true;
        break;
      case "--output":
        args.output = next();
        break;
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
    const analyzer = new AnalyticsAnalyzer();

    let result: unknown;
    switch (args.analysisType) {
      case "seo":
        result = await analyzer.analyzeSeo(args.days, args.channel);
        break;
      case "sources":
        result = await analyzer.analyzeTrafficSources(args.days);
        break;
      case "content":
        result = await analyzer.analyzeContentPerformance(args.days);
        break;
      case "devices":
        result = await analyzer.analyzeDevicePerformance(args.days);
        break;
      case "overview":
      default:
        result = await analyzer.comparePeriods(args.days);
        break;
    }

    const output = JSON.stringify(result, null, 2);
    if (args.output) {
      writeFileSync(args.output, output);
      console.error(`Analysis saved to ${args.output}`);
    } else {
      console.log(output);
    }
  } catch (e) {
    console.error(`Error: ${e instanceof Error ? e.message : e}`);
    process.exit(1);
  }
}

if ((import.meta as any).main ?? process.argv[1]?.endsWith("analyze.ts")) {
  main();
}
