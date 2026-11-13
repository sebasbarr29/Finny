import "server-only";
import type { AiReport, Language } from "./ai";
import { sql } from "./db";
import type { Comparison, Metrics } from "./finance";

export type ReportRow = {
  id: string;
  language: Language;
  period_label: string;
  previous_period: string | null;
  source_files: string[];
  metrics: Metrics;
  comparison: Comparison | null;
  content: AiReport;
  model: string;
  is_sample: boolean;
  created_at: Date;
};

export type ReportSummary = Pick<ReportRow, "id" | "language" | "period_label" | "previous_period" | "is_sample" | "created_at"> & {
  net_profit: number;
};

export async function saveReport(userId: string, r: Omit<ReportRow, "id" | "created_at" | "is_sample">): Promise<string> {
  const rows = await sql<{ id: string }>(
    `INSERT INTO reports (user_id, language, period_label, previous_period, source_files, metrics, comparison, content, model)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id::text AS id`,
    [userId, r.language, r.period_label, r.previous_period, r.source_files,
     JSON.stringify(r.metrics), r.comparison ? JSON.stringify(r.comparison) : null, JSON.stringify(r.content), r.model],
  );
  return rows[0].id;
}

/** Always scoped to the logged-in user: a report id from someone else returns nothing. */
export async function getReport(userId: string, id: string): Promise<ReportRow | null> {
  if (!/^\d{1,18}$/.test(id)) return null;
  const rows = await sql<ReportRow>(
    `SELECT id::text AS id, language, period_label, previous_period, source_files, metrics, comparison, content, model, is_sample, created_at
       FROM reports WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return rows[0] ?? null;
}

export async function listReports(userId: string): Promise<ReportSummary[]> {
  return sql<ReportSummary>(
    `SELECT id::text AS id, language, period_label, previous_period, is_sample, created_at,
            (metrics->>'netProfit')::float AS net_profit
       FROM reports WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
    [userId],
  );
}

export async function reportsCreatedToday(userId: string): Promise<number> {
  const rows = await sql<{ n: number }>(
    `SELECT count(*)::int AS n FROM reports WHERE user_id = $1 AND NOT is_sample AND created_at > now() - interval '24 hours'`,
    [userId],
  );
  return rows[0].n;
}
