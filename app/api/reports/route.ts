import { NextResponse } from "next/server";
import { AiError, buildFacts, MODEL, writeReports, type Language } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { compare, CsvError, MAX_FILE_BYTES, parseStatement, type Comparison } from "@/lib/finance";
import { reportsCreatedToday, saveReport } from "@/lib/reports";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // Claude can take up to a minute or two to write both reports

const DAILY_LIMIT = 20;

const fail = (status: number, error: string) => NextResponse.json({ error }, { status });

async function readCsv(value: FormDataEntryValue | null, label: string): Promise<{ name: string; text: string } | null> {
  if (!value || typeof value === "string" || value.size === 0) return null;
  const name = value.name || `${label}.csv`;
  if (!/\.(csv|txt)$/i.test(name) && !/csv|text\/plain/.test(value.type)) {
    throw new CsvError(`"${name}" isn't a CSV file. In Excel or Google Sheets, use File → Download/Save as → CSV.`);
  }
  if (value.size > MAX_FILE_BYTES) throw new CsvError(`"${name}" is larger than 2 MB. Upload one month at a time.`);
  return { name, text: await value.text() };
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail(401, "Your session has ended. Log in again.");

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return fail(400, "The upload didn't come through. Please try again.");
  }

  const language: Language = form.get("language") === "es" ? "es" : "en";

  try {
    const current = await readCsv(form.get("current"), "this-month");
    const previous = await readCsv(form.get("previous"), "previous-month");
    if (!current) return fail(400, "Choose a CSV file for this month.");

    if ((await reportsCreatedToday(user.id)) >= DAILY_LIMIT) {
      return fail(429, `You've created ${DAILY_LIMIT} reports in the last 24 hours. Try again tomorrow.`);
    }

    const cur = parseStatement(current.text, current.name, "This month");
    let comparison: Comparison | null = null;
    if (previous) {
      const prev = parseStatement(previous.text, previous.name, "Previous month");
      if (prev.period === cur.period && cur.period !== "This month") {
        return fail(400, `Both files look like ${cur.period}. Upload two different months to compare them.`);
      }
      comparison = compare(cur, prev);
    }

    const facts = buildFacts(cur, comparison);
    const content = await writeReports(facts, language);

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
    return NextResponse.json({ id });
  } catch (err) {
    if (err instanceof CsvError) return fail(400, err.message);
    if (err instanceof AiError) return fail(502, err.message);
    console.error("Report creation failed", err);
    return fail(500, "Something went wrong while creating your report. Please try again.");
  }
}
