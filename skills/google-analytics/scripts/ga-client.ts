#!/usr/bin/env bun
/**
 * Google Analytics 4 Data API Client (TypeScript)
 *
 * Fetches analytics data from Google Analytics 4 using the Data API.
 * Authentication uses service-account credentials from environment variables.
 *
 * Usage:
 *   bun run ga-client.ts --days 30 --metrics sessions,users
 *   bun run ga-client.ts --start 2026-01-01 --end 2026-01-31 --dimensions country
 *   bun run ga-client.ts --days 7 --metrics sessions --dimensions pagePath --limit 10
 *
 * (Works the same under `npx tsx ga-client.ts ...` if you don't have Bun.)
 *
 * Environment Variables:
 *   GOOGLE_ANALYTICS_PROPERTY_ID:   GA4 property ID (required)
 *   GOOGLE_APPLICATION_CREDENTIALS: Path to service-account JSON (required)
 */

import { existsSync } from "node:fs";
import { writeFileSync } from "node:fs";

let BetaAnalyticsDataClient: any;
try {
  ({ BetaAnalyticsDataClient } = await import("@google-analytics/data"));
} catch {
  console.error(
    "Error: '@google-analytics/data' is not installed.\n" +
      "Install with: bun add @google-analytics/data   (or: npm i @google-analytics/data)",
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParsedRow {
  dimensions: Record<string, string>;
  metrics: Record<string, string>;
}

export interface ReportResult {
  dimension_headers: string[];
  metric_headers: { name: string; type: string }[];
  rows: ParsedRow[];
  row_count: number;
  totals?: { value: string }[];
  metadata: Record<string, unknown>;
}

export interface RunReportOptions {
  startDate: string;
  endDate: string;
  metrics: string[];
  dimensions?: string[];
  limit?: number;
  orderBy?: string;
  filterExpression?: string;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class GoogleAnalyticsClient {
  private propertyId: string;
  private client: any;

  constructor(propertyId?: string) {
    // Explicit arg wins; env is the fallback ("give me one property" UX).
    this.propertyId = propertyId ?? process.env.GOOGLE_ANALYTICS_PROPERTY_ID ?? "";
    if (!this.propertyId) {
      throw new Error(
        "No GA4 property ID. Pass --property <id> or set " +
          "GOOGLE_ANALYTICS_PROPERTY_ID. Find it in GA4: Admin > Property Settings.",
      );
    }

    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!credentialsPath) {
      throw new Error(
        "GOOGLE_APPLICATION_CREDENTIALS environment variable not set. " +
          "Set it to the path of your service-account JSON file.",
      );
    }
    if (!existsSync(credentialsPath)) {
      throw new Error(`Service account file not found: ${credentialsPath}`);
    }

    try {
      // The client auto-reads GOOGLE_APPLICATION_CREDENTIALS.
      this.client = new BetaAnalyticsDataClient();
    } catch (e) {
      throw new Error(
        `Failed to initialize Google Analytics client: ${e}\n` +
          "Verify your service account has access to the GA4 property.",
      );
    }
  }

  async runReport(opts: RunReportOptions): Promise<ReportResult> {
    const {
      startDate,
      endDate,
      metrics,
      dimensions = [],
      limit = 10,
      orderBy,
      filterExpression,
    } = opts;

    const request: Record<string, unknown> = {
      property: `properties/${this.propertyId}`,
      dateRanges: [{ startDate, endDate }],
      metrics: metrics.map((name) => ({ name })),
      dimensions: dimensions.map((name) => ({ name })),
      limit,
    };

    // Ordering: prefix with "-" for desc (default), "+" for asc.
    if (orderBy) {
      let field = orderBy;
      let desc = true;
      if (field.startsWith("+")) {
        desc = false;
        field = field.slice(1);
      } else if (field.startsWith("-")) {
        field = field.slice(1);
      }

      if (metrics.includes(field)) {
        request.orderBys = [{ metric: { metricName: field }, desc }];
      } else if (dimensions.includes(field)) {
        request.orderBys = [{ dimension: { dimensionName: field }, desc }];
      }
    }

    // Filter: "fieldName:value" → exact string match.
    if (filterExpression && filterExpression.includes(":")) {
      const idx = filterExpression.indexOf(":");
      const fieldName = filterExpression.slice(0, idx);
      const value = filterExpression.slice(idx + 1);
      request.dimensionFilter = {
        filter: { fieldName, stringFilter: { value } },
      };
    }

    let response: any;
    try {
      [response] = await this.client.runReport(request);
    } catch (e) {
      throw new Error(`Failed to run report: ${e}`);
    }

    return this.parseResponse(response);
  }

  private parseResponse(response: any): ReportResult {
    const result: ReportResult = {
      dimension_headers: (response.dimensionHeaders ?? []).map(
        (h: any) => h.name,
      ),
      metric_headers: (response.metricHeaders ?? []).map((h: any) => ({
        name: h.name,
        type: String(h.type),
      })),
      rows: [],
      row_count: Number(response.rowCount ?? 0),
      metadata: {},
    };

    if (response.totals && response.totals.length > 0) {
      result.totals = (response.totals[0].metricValues ?? []).map((v: any) => ({
        value: v.value,
      }));
    }

    for (const row of response.rows ?? []) {
      const parsed: ParsedRow = { dimensions: {}, metrics: {} };
      (row.dimensionValues ?? []).forEach((v: any, i: number) => {
        parsed.dimensions[result.dimension_headers[i]] = v.value;
      });
      (row.metricValues ?? []).forEach((v: any, i: number) => {
        parsed.metrics[result.metric_headers[i].name] = v.value;
      });
      result.rows.push(parsed);
    }

    return result;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function parseDateRange(
  days?: number,
  start?: string,
  end?: string,
): [string, string] {
  if (days) return [`${days}daysAgo`, "yesterday"];
  if (start && end) return [start, end];
  return ["7daysAgo", "yesterday"]; // default: last 7 days
}

export function formatAsTable(result: ReportResult): string {
  const lines: string[] = [];
  const headers = [
    ...result.dimension_headers,
    ...result.metric_headers.map((m) => m.name),
  ];
  const headerLine = headers.join(" | ");
  lines.push(headerLine);
  lines.push("-".repeat(headerLine.length));

  for (const row of result.rows) {
    const values: string[] = [];
    for (const dim of result.dimension_headers) {
      values.push(row.dimensions[dim] ?? "");
    }
    for (const metric of result.metric_headers) {
      values.push(row.metrics[metric.name] ?? "");
    }
    lines.push(values.join(" | "));
  }

  if (result.totals) {
    lines.push("-".repeat(headerLine.length));
    const totalValues = ["TOTAL"];
    for (let i = 1; i < result.dimension_headers.length; i++) totalValues.push("");
    for (const t of result.totals) totalValues.push(t.value);
    lines.push(totalValues.join(" | "));
  }

  lines.push("");
  lines.push(`Total rows: ${result.row_count}`);
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

interface Args {
  days?: number;
  start?: string;
  end?: string;
  metrics?: string;
  dimensions?: string;
  limit: number;
  orderBy?: string;
  filter?: string;
  format: "json" | "table";
  output?: string;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { limit: 10, format: "json" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => argv[++i];
    switch (a) {
      case "--days":
        args.days = parseInt(next(), 10);
        break;
      case "--start":
        args.start = next();
        break;
      case "--end":
        args.end = next();
        break;
      case "--metrics":
        args.metrics = next();
        break;
      case "--dimensions":
        args.dimensions = next();
        break;
      case "--limit":
        args.limit = parseInt(next(), 10);
        break;
      case "--order-by":
        args.orderBy = next();
        break;
      case "--filter":
        args.filter = next();
        break;
      case "--format":
        args.format = next() as "json" | "table";
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

  if (!args.metrics) {
    console.error(
      "Error: --metrics is required (e.g., --metrics sessions,users,bounceRate)",
    );
    process.exit(1);
  }

  try {
    const client = new GoogleAnalyticsClient();
    const [startDate, endDate] = parseDateRange(args.days, args.start, args.end);

    const metrics = args.metrics.split(",").map((m) => m.trim());
    const dimensions = args.dimensions
      ? args.dimensions.split(",").map((d) => d.trim())
      : undefined;

    const result = await client.runReport({
      startDate,
      endDate,
      metrics,
      dimensions,
      limit: args.limit,
      orderBy: args.orderBy,
      filterExpression: args.filter,
    });

    const output =
      args.format === "json"
        ? JSON.stringify(result, null, 2)
        : formatAsTable(result);

    if (args.output) {
      writeFileSync(args.output, output);
      console.error(`Report saved to ${args.output}`);
    } else {
      console.log(output);
    }
  } catch (e) {
    console.error(`Error: ${e instanceof Error ? e.message : e}`);
    process.exit(1);
  }
}

// Run only when invoked directly (so analyze.ts can import the client).
if ((import.meta as any).main ?? process.argv[1]?.endsWith("ga-client.ts")) {
  main();
}
