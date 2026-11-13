import { NextResponse } from "next/server";
import { AiError, askFinny, type ChatTurn } from "@/lib/ai";
import { getCurrentUser } from "@/lib/auth";
import { getPlan, FREE_QUESTIONS } from "@/lib/billing";
import { sql } from "@/lib/db";
import { askData } from "@/lib/reports";
import { aiContext, getSettings } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Your session has ended. Log in again." }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { question?: unknown };
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!question) return NextResponse.json({ error: "Type a question first." }, { status: 400 });
  if (question.length > 600) return NextResponse.json({ error: "Please keep questions under 600 characters." }, { status: 400 });

  const plan = await getPlan(user.id);
  if (!plan.canAsk) {
    return NextResponse.json(
      plan.kind === "free"
        ? { error: `You've used your ${FREE_QUESTIONS} free questions. Subscribe for $29/month for unlimited questions.`, needsSubscription: true }
        : { error: "You've reached today's question limit. Try again tomorrow." },
      { status: plan.kind === "free" ? 402 : 429 },
    );
  }

  const data = await askData(user.id);
  if (data.months_on_file === 0) {
    return NextResponse.json({ error: "Upload a month of data first so Finny has numbers to answer from." }, { status: 400 });
  }

  const history = (
    await sql<ChatTurn>(
      `SELECT role, content FROM (
         SELECT role, content, created_at, id FROM chat_messages WHERE user_id = $1 ORDER BY created_at DESC, id DESC LIMIT 8
       ) t ORDER BY created_at ASC, id ASC`,
      [user.id],
    )
  );

  try {
    const settings = await getSettings(user.id);
    const answer = await askFinny(data, history, question, aiContext(settings));
    await sql("INSERT INTO chat_messages (user_id, role, content) VALUES ($1, 'user', $2), ($1, 'assistant', $3)", [user.id, question, answer]);
    const after = await getPlan(user.id);
    return NextResponse.json({ answer, freeQuestionsLeft: after.kind === "free" ? after.freeQuestionsLeft : null });
  } catch (err) {
    if (err instanceof AiError) return NextResponse.json({ error: err.message }, { status: 502 });
    console.error("Ask Finny failed", err);
    return NextResponse.json({ error: "Finny couldn't answer right now. Please try again." }, { status: 500 });
  }
}
