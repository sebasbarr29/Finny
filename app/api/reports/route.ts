import { NextResponse } from "next/server";
import { ensureActionItems } from "@/lib/actions";
import { AiError, buildFacts, MODEL, writeReports, type Language } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { getPlan, PRICE_LABEL } from "@/lib/billing";
import { compare, CsvError, type Comparison } from "@/lib/finance";
import { reportsCreatedToday, saveReport } from "@/lib/reports";
import { aiContext, getSettings } from "@/lib/settings";
import { parseWithPeriod, periodFromInput, readUpload } from "@/lib/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // Claude can take up to a minute or two to write the reports

const DAILY_LIMIT = 20;

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Your session has ended. Log in again.");

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, "The upload didn't come through. Please try again.");
  }

  const settings = await getSettings(user.id);
  const langInput = form.get("language");
  const language: Language = langInput === "es" ? "es" : langInput === "en" ? "en" : settings.language;

  try {
    const current = await readUpload(form.get("current"), "this-month");
    const previous = await readUpload(form.get("previous"), "previous-month");
    if (!current) return fail(400, "Choose a file for this month.");

    const plan = await getPlan(user.id);
    if (!plan.canCreateReport) {
      return NextResponse.json(
        { error: `You've used your free report. Subscribe for ${PRICE_LABEL} to create more reports.`, needsSubscription: true },
        { status: 402 },
      );
    }
    if ((await reportsCreatedToday(user.id)) >= DAILY_LIMIT) {
      return fail(429, `You've created ${DAILY_LIMIT} reports in the last 24 hours. Try again tomorrow.`);
    }

    const cur = parseWithPeriod(current, "This month", periodFromInput(form.get("current_period")));
    let comparison: Comparison | null = null;
    if (previous) {
      const prev = parseWithPeriod(previous, "Previous month", periodFromInput(form.get("previous_period")));
      if (prev.period === cur.period && cur.period !== "This month") {
        return fail(400, `Both files are set to ${cur.period}. Pick two different months to compare them.`);
      }
      comparison = compare(cur, prev);
    }

    const facts = buildFacts(cur, comparison);
    const content = await writeReports(facts, language, aiContext(settings));

    const id = await saveReport(user.id, {
      language,
      period_label: cur.period,
      previous_period: comparison?.previousPeriod ?? null,
      source_files: [current.name, ...(previous ? [previous.name] : [])],
      metrics: cur,
      comparison,
      content,
      model: MODEL,
    });
    await ensureActionItems(user.id, id, content);
    return NextResponse.json({ id });
  } catch (err) {
    if (err instanceof CsvError) return fail(400, err.message);
    if (err instanceof AiError) return fail(502, err.message);
    console.error("Report creation failed", err);
    return fail(500, "Something went wrong while creating your report. Please try again.");
  }
}
