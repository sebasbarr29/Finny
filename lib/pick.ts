import "server-only";
import { latestByMonth, type ReportSummary } from "./reports";

/** Options for the month picker plus the report to show (from ?report= or the latest month). */
export function pickReport(list: ReportSummary[], requested?: string) {
  const options = list.map((r) => ({
    id: r.id,
    label: `${r.period_label}${r.previous_period ? ` (vs ${r.previous_period.split(" ")[0]})` : ""} · ${r.language === "es" ? "ES" : "EN"} · ${new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
  }));
  const chosen = list.find((r) => r.id === requested) ?? latestByMonth(list);
  return { options, chosenId: chosen?.id ?? null };
}
