import type { Metadata } from "next";
import Link from "next/link";
import { IconCheck } from "@/app/components/icons";
import { requireUser } from "@/lib/auth";
import { getPlan, getStripe, handleCheckoutCompleted } from "@/lib/billing";

export const metadata: Metadata = { title: "Subscription confirmed | Finny" };
export const dynamic = "force-dynamic";

export default async function BillingSuccess({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const user = await requireUser();
  const { session_id } = await searchParams;

  // The webhook is the source of truth, but it can arrive a few seconds after the redirect.
  // Checking the session here as well means the plan is correct right away.
  if (session_id && /^cs_[A-Za-z0-9_]+$/.test(session_id)) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(session_id);
      if (session.client_reference_id === user.id && session.status === "complete") {
        await handleCheckoutCompleted(session);
      }
    } catch (err) {
      console.error("Could not confirm checkout session", err);
    }
  }

  const plan = await getPlan(user.id);
  const active = plan.kind === "paid";

  return (
    <div className="page">
      <section className="card success-card">
        <span className="ic-tile"><IconCheck /></span>
        <h1>{active ? "You're subscribed to Finny Pro" : "Payment received"}</h1>
        <p className="muted">
          {active
            ? "Thanks! Your plan is active, so you can create as many reports and ask as many questions as you need."
            : "Thanks! We're confirming your payment with Stripe. Your plan will show as active within a minute."}
        </p>
        <div className="row-actions">
          <Link className="btn btn-primary" href="/upload">Upload a month</Link>
          <Link className="btn btn-secondary" href="/dashboard">Go to dashboard</Link>
        </div>
      </section>
    </div>
  );
}
