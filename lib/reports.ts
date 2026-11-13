import "server-only";
import type { AiReport, Language } from "./ai";
import { buildFacts } from "./ai";
import { sql } from "./db";
import type { Comparison, Metrics } from "./finance";
import { periodKey } from "./i18n";

export type ReportRow = {
  id: string;
  language: Language;
  period_label: string;
  previous_period: string | null;
  source_files: string[];
  metrics: Metrics;
  comparison: Comparison | null;
  content: AiReport;
  translations: Partial<Record<Language, AiReport>>;
  model: string;
  is_sample: boolean;
  created_at: Date;
};

export type ReportSummary = Pick<ReportRow, "id" | "language" | "period_label" | "previous_period" | "is_sample" | "created_at"> & {
  revenue: number;
  expenses: number;
  net_profit: number;
  margin: number | null;
  headline: string | null;
};

const ID_RE = /^\d{1,18}$/;

export async function saveReport(
  userId: string,
  r: Omit<ReportRow, "id" | "created_at" | "is_sample" | "translations">,
): Promise<string> {
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
  if (!ID_RE.test(id)) return null;
  const rows = await sql<ReportRow>(
    `SELECT id::text AS id, language, period_label, previous_period, source_files, metrics, comparison, content,
            translations, model, is_sample, created_at
       FROM reports WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );
  return rows[0] ?? null;
}

/** The report's text in the requested language, if it exists (original or saved translation). */
export function contentIn(r: Pick<ReportRow, "language" | "content" | "translations">, lang: Language): AiReport | null {
  if (r.language === lang) return r.content;
  return r.translations?.[lang] ?? null;
}

export async function saveTranslation(userId: string, id: string, lang: Language, content: AiReport): Promise<void> {
  await sql(
    `UPDATE reports SET translations = translations || jsonb_build_object($3::text, $4::jsonb)
      WHERE id = $1 AND user_id = $2`,
    [id, userId, lang, JSON.stringify(content)],
  );
}

/** Newest first. */
export async function listReports(userId: string): Promise<ReportSummary[]> {
  return sql<ReportSummary>(
    `SELECT id::text AS id, language, period_label, previous_period, is_sample, created_at,
            (metrics->>'revenue')::float AS revenue,
            (metrics->>'expenses')::float AS expenses,
            (metrics->>'netProfit')::float AS net_profit,
            (metrics->>'marginPct')::float AS margin,
            content->'monthly_report'->>'headline' AS headline
       FROM reports WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT 200`,
    [userId],
  );
}

/** The most recent month the user has data for (by month, then by upload time). */
export function latestByMonth(list: ReportSummary[]): ReportSummary | null {
  return [...list].sort((a, b) => periodKey(b.period_label) - periodKey(a.period_label) || +new Date(b.created_at) - +new Date(a.created_at))[0] ?? null;
}

export type MonthPoint = { period: string; revenue: number; expenses: number; netProfit: number; reportId: string };

/**
 * One point per month for trend charts, using the newest report for each month,
 * plus the previous month from any two-month upload (so a single comparison report still gives two points).
 */
export async function monthSeries(userId: string): Promise<MonthPoint[]> {
  const rows = await sql<{ id: string; period_label: string; metrics: Metrics; comparison: Comparison | null }>(
    `SELECT id::text AS id, period_label, metrics, comparison FROM reports WHERE user_id = $1 ORDER BY created_at ASC, id ASC`,
    [userId],
  );
  const map = new Map<string, MonthPoint>();
  for (const r of rows) {
    if (r.comparison && !map.has(r.comparison.previousPeriod)) {
      const p = r.comparison.previous;
      map.set(r.comparison.previousPeriod, { period: r.comparison.previousPeriod, revenue: p.revenue, expenses: p.expenses, netProfit: p.netProfit, reportId: r.id });
    }
    map.set(r.period_label, { period: r.period_label, revenue: r.metrics.revenue, expenses: r.metrics.expenses, netProfit: r.metrics.netProfit, reportId: r.id });
  }
  return [...map.values()].filter((p) => periodKey(p.period) !== Number.MAX_SAFE_INTEGER).sort((a, b) => periodKey(a.period) - periodKey(b.period));
}

/** All saved months as calculated facts, for Ask Finny. Newest report per month wins. */
export async function askData(userId: string) {
  const rows = await sql<{ period_label: string; metrics: Metrics; comparison: Comparison | null; created_at: Date }>(
    `SELECT period_label, metrics, comparison, created_at FROM reports WHERE user_id = $1 ORDER BY created_at ASC, id ASC`,
    [userId],
  );
  const byMonth = new Map<string, ReturnType<typeof buildFacts>>();
  for (const r of rows) byMonth.set(r.period_label, buildFacts(r.metrics, r.comparison));
  const months = [...byMonth.entries()].sort((a, b) => periodKey(a[0]) - periodKey(b[0])).map(([, f]) => f);
  return { months_on_file: months.length, months };
}

export async function reportsCreatedToday(userId: string): Promise<number> {
  const rows = await sql<{ n: number }>(
    `SELECT count(*)::int AS n FROM reports WHERE user_id = $1 AND NOT is_sample AND created_at > now() - interval '24 hours'`,
    [userId],
  );
  return rows[0].n;
}

export type SampleReport = Pick<ReportRow, "period_label" | "previous_period" | "metrics" | "comparison" | "content">;

/**
 * Public sample: the demo account's earliest two-month report (made from the sample clinic CSVs),
 * in the requested language when one exists. Uses the earliest so later demo uploads don't change it.
 */
export async function getSampleReport(lang: Language): Promise<SampleReport | null> {
  const rows = await sql<ReportRow>(
    `SELECT r.id::text AS id, r.language, r.period_label, r.previous_period, r.metrics, r.comparison, r.content, r.translations
       FROM reports r JOIN users u ON u.id = r.user_id
      WHERE u.is_demo AND r.previous_period IS NOT NULL
      ORDER BY r.id ASC LIMIT 20`,
  );
  const exact = rows.find((r) => r.language === lang);
  if (exact) return exact;
  const translated = rows.find((r) => r.translations?.[lang]);
  if (translated) return { ...translated, content: translated.translations[lang]! };
  return rows[0] ?? null;
}
