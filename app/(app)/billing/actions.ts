"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { BillingError, getPlan, getStripe, siteUrl } from "@/lib/billing";
import { sql } from "@/lib/db";

export async function startCheckout(): Promise<void> {
  const user = await requireUser();
  const plan = await getPlan(user.id);
  if (plan.kind === "paid") redirect("/billing?billing=already");

  const priceId = process.env.STRIPE_PRICE_ID;
  let url: string | null = null;
  try {
    if (!priceId) throw new BillingError("STRIPE_PRICE_ID is missing on the server.");
    const stripe = getStripe();

    // Reuse the user's Stripe customer so payments stay attached to one account.
    const rows = await sql<{ stripe_customer_id: string | null }>("SELECT stripe_customer_id FROM users WHERE id = $1", [user.id]);
    let customerId = rows[0]?.stripe_customer_id ?? null;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.name ?? undefined, metadata: { userId: user.id } });
      customerId = customer.id;
      await sql("UPDATE users SET stripe_customer_id = $1 WHERE id = $2 AND stripe_customer_id IS NULL", [customerId, user.id]);
    }

    const base = siteUrl(await headers());
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      metadata: { userId: user.id },
      subscription_data: { metadata: { userId: user.id } },
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${base}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/billing?billing=canceled`,
      allow_promotion_codes: false,
    });
    url = session.url;
  } catch (err) {
    console.error("Checkout failed", err);
    redirect("/billing?billing=error");
  }
  if (!url) redirect("/billing?billing=error");
  redirect(url);
}

/** Opens Stripe's customer portal so subscribers can update their card or cancel. */
export async function openBillingPortal(): Promise<void> {
  const user = await requireUser();
  const rows = await sql<{ stripe_customer_id: string | null }>("SELECT stripe_customer_id FROM users WHERE id = $1", [user.id]);
  const customerId = rows[0]?.stripe_customer_id;
  if (!customerId) redirect("/billing?billing=no-customer");
  let url: string | null = null;
  try {
    const base = siteUrl(await headers());
    const session = await getStripe().billingPortal.sessions.create({ customer: customerId, return_url: `${base}/billing` });
    url = session.url;
  } catch (err) {
    console.error("Billing portal failed", err);
    redirect("/billing?billing=portal-error");
  }
  if (!url) redirect("/billing?billing=portal-error");
  redirect(url);
}
