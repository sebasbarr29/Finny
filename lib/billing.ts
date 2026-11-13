import "server-only";
import Stripe from "stripe";
import { sql } from "./db";

export const FREE_REPORTS = 1;
export const PRICE_LABEL = "$29/month";

let stripe: Stripe | null = null;
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new BillingError("Payments aren't set up yet: STRIPE_SECRET_KEY is missing on the server.");
  stripe ??= new Stripe(key);
  return stripe;
}

export class BillingError extends Error {}

export type Plan = {
  kind: "free" | "paid" | "demo";
  status: string | null;
  freeUsed: number;
  freeLeft: number;
  canCreateReport: boolean;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
};

const PAID_STATUSES = new Set(["active", "trialing"]);

export async function getPlan(userId: string): Promise<Plan> {
  const rows = await sql<{
    is_demo: boolean;
    subscription_status: string | null;
    current_period_end: Date | null;
    cancel_at_period_end: boolean;
    used: number;
  }>(
    `SELECT u.is_demo, u.subscription_status, u.current_period_end, u.cancel_at_period_end,
            (SELECT count(*)::int FROM reports r WHERE r.user_id = u.id AND NOT r.is_sample) AS used
       FROM users u WHERE u.id = $1`,
    [userId],
  );
  const u = rows[0];
  const paid = !!u && PAID_STATUSES.has(u.subscription_status ?? "");
  const kind: Plan["kind"] = paid ? "paid" : u?.is_demo ? "demo" : "free";
  const freeUsed = Math.min(u?.used ?? 0, FREE_REPORTS);
  return {
    kind,
    status: u?.subscription_status ?? null,
    freeUsed,
    freeLeft: FREE_REPORTS - freeUsed,
    // The grader demo account can always create reports so the whole flow can be tested.
    canCreateReport: kind !== "free" || (u?.used ?? 0) < FREE_REPORTS,
    currentPeriodEnd: u?.current_period_end ?? null,
    cancelAtPeriodEnd: u?.cancel_at_period_end ?? false,
  };
}

/** Copies a Stripe subscription's state onto the user who owns the Stripe customer. */
export async function syncSubscription(sub: Stripe.Subscription, userIdHint?: string | null): Promise<void> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const periodEnd = sub.items?.data?.[0]?.current_period_end;
  const params = [
    customerId,
    sub.id,
    sub.status,
    periodEnd ? new Date(periodEnd * 1000) : null,
    sub.cancel_at_period_end ?? false,
  ];
  const updated = await sql(
    `UPDATE users SET stripe_subscription_id = $2, subscription_status = $3, current_period_end = $4, cancel_at_period_end = $5
      WHERE stripe_customer_id = $1 RETURNING id`,
    params,
  );
  if (updated.length === 0 && userIdHint && /^\d+$/.test(userIdHint)) {
    await sql(
      `UPDATE users SET stripe_customer_id = $1, stripe_subscription_id = $2, subscription_status = $3,
              current_period_end = $4, cancel_at_period_end = $5
        WHERE id = $6 AND (stripe_customer_id IS NULL OR stripe_customer_id = $1)`,
      [...params, userIdHint],
    );
  }
}

/** Handles a completed Checkout Session (from the webhook or the success page). */
export async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  if (session.mode !== "subscription" || !session.subscription) return;
  const userId = session.client_reference_id ?? session.metadata?.userId ?? null;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  if (userId && customerId && /^\d+$/.test(userId)) {
    await sql(`UPDATE users SET stripe_customer_id = $1 WHERE id = $2 AND stripe_customer_id IS NULL`, [customerId, userId]);
  }
  const sub =
    typeof session.subscription === "string"
      ? await getStripe().subscriptions.retrieve(session.subscription)
      : session.subscription;
  await syncSubscription(sub, userId);
}

export function siteUrl(reqHeaders: Headers): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const host = reqHeaders.get("x-forwarded-host") ?? reqHeaders.get("host") ?? "localhost:3000";
  const proto = reqHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
