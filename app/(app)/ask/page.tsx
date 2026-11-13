import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/app/components/PageHeader";
import { requireUser } from "@/lib/auth";
import { FREE_QUESTIONS, getPlan } from "@/lib/billing";
import { sql } from "@/lib/db";
import { monthSeries } from "@/lib/reports";
import AskChat from "./AskChat";

export const metadata: Metadata = { title: "Ask Finny | Finny" };
export const dynamic = "force-dynamic";

export default async function AskPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireUser();
  const [{ q }, plan, months, history] = await Promise.all([
    searchParams,
    getPlan(user.id),
    monthSeries(user.id),
    sql<{ id: string; role: "user" | "assistant"; content: string }>(
      `SELECT id::text AS id, role, content FROM (
         SELECT id, role, content, created_at FROM chat_messages WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT 40
       ) t ORDER BY created_at ASC, id ASC`,
      [user.id],
    ),
  ]);

  const hasData = months.length > 0;
  const latest = months[months.length - 1]?.period;
  const suggestions = hasData
    ? [
        `Why did my profit change in ${latest}?`,
        "Which expense grew the most?",
        "What were my three biggest costs last month?",
        "¿Cómo se comparan mis ingresos con el mes anterior?",
      ]
    : [];

  return (
    <div className="page">
      <PageHeader
        eyebrow="Ask Finny"
        title="Ask about your numbers"
        description="Finny answers only from the months you've uploaded, and tells you when the data isn't there instead of guessing."
      />
      {!hasData ? (
        <section className="card empty-state">
          <h2 className="card-title">Upload a month first</h2>
          <p className="muted">Ask Finny needs at least one month of your numbers to answer from.</p>
          <Link className="btn btn-primary" href="/upload">Upload a month</Link>
        </section>
      ) : (
        <AskChat
          initial={history}
          suggestions={suggestions}
          prefill={q ?? ""}
          months={months.map((m) => m.period)}
          locked={!plan.canAsk}
          isFree={plan.kind === "free"}
          freeLeft={plan.kind === "free" ? plan.freeQuestionsLeft : null}
          freeTotal={FREE_QUESTIONS}
        />
      )}
      <p className="disclaimer">Finny gives general business guidance, not tax, legal, or investment advice.</p>
    </div>
  );
}
