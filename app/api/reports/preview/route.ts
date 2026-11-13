import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { CsvError, type Metrics } from "@/lib/finance";
import { parseWithPeriod, periodFromInput, readUpload } from "@/lib/upload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Step 1 of the upload flow: read the file(s) and return the calculated numbers for review.
// Nothing is saved and no AI is called here.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Your session has ended. Log in again." }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "The upload didn't come through. Please try again." }, { status: 400 });
  }

  try {
    const current = await readUpload(form.get("current"), "this-month");
    if (!current) return NextResponse.json({ error: "Choose a file for this month." }, { status: 400 });
    const previous = await readUpload(form.get("previous"), "previous-month");

    const cur = parseWithPeriod(current, "This month", periodFromInput(form.get("current_period")));
    const prev = previous ? parseWithPeriod(previous, "Previous month", periodFromInput(form.get("previous_period"))) : null;

    const warnings: string[] = [];
    const check = (m: Metrics, name: string) => {
      if (m.revenue === 0) warnings.push(`No revenue found in "${name}". If that's wrong, check the Type column or the signs of your amounts.`);
      if (m.expenses === 0) warnings.push(`No expenses found in "${name}". If that's wrong, check the Type column or the signs of your amounts.`);
      if (m.rowsSkipped > 0) warnings.push(`${m.rowsSkipped} row${m.rowsSkipped === 1 ? " was" : "s were"} skipped in "${name}" (totals, blanks or text in the amount column).`);
      if (m.period === "This month" || m.period === "Previous month") warnings.push(`Finny couldn't find the month in "${name}". Pick it below.`);
    };
    check(cur, current.name);
    if (prev && previous) check(prev, previous.name);
    if (prev && prev.period === cur.period && !["This month", "Previous month"].includes(cur.period)) {
      warnings.push(`Both files look like ${cur.period}. Pick different months below to compare them.`);
    }

    const pick = (m: Metrics) => ({
      period: m.period, revenue: m.revenue, expenses: m.expenses, netProfit: m.netProfit, marginPct: m.marginPct,
      topExpenses: m.topExpenses, rowsUsed: m.rowsUsed, rowsSkipped: m.rowsSkipped, format: m.format,
    });
    return NextResponse.json({
      current: { file: current.name, ...pick(cur) },
      previous: prev && previous ? { file: previous.name, ...pick(prev) } : null,
      warnings,
    });
  } catch (err) {
    if (err instanceof CsvError) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("Preview failed", err);
    return NextResponse.json({ error: "Something went wrong while reading your file. Please try again." }, { status: 500 });
  }
}
