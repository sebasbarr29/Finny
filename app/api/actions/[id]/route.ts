import { NextResponse } from "next/server";
import { setActionDone } from "@/lib/actions";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Tick or untick one action plan item. Only the owner's items can change.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Your session has ended. Log in again." }, { status: 401 });
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { done?: unknown };
  if (typeof body.done !== "boolean") return NextResponse.json({ error: "Missing done flag." }, { status: 400 });
  const ok = await setActionDone(user.id, id, body.done);
  if (!ok) return NextResponse.json({ error: "Item not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
