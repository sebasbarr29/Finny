import { NextResponse } from "next/server";
import { AiError, buildFacts, writeReports, type Language } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { contentIn, getReport, saveTranslation } from "@/lib/reports";
import { aiContext, getSettings } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

// Writes a saved report in the other language from the same calculated numbers, then stores it.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Your session has ended. Log in again." }, { status: 401 });
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { lang?: string };
  const lang: Language = body.lang === "es" ? "es" : "en";

  const report = await getReport(user.id, id);
  if (!report) return NextResponse.json({ error: "Report not found." }, { status: 404 });
  if (contentIn(report, lang)) return NextResponse.json({ ok: true });

  try {
    const settings = await getSettings(user.id);
    const content = await writeReports(buildFacts(report.metrics, report.comparison), lang, aiContext(settings));
    await saveTranslation(user.id, id, lang, content);
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof AiError) return NextResponse.json({ error: err.message }, { status: 502 });
    console.error("Translation failed", err);
    return NextResponse.json({ error: "Couldn't switch the language right now. Please try again." }, { status: 500 });
  }
}
