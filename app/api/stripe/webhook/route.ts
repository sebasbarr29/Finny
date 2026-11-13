import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, handleCheckoutCompleted, syncSubscription } from "@/lib/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Stripe calls this URL after events like a successful payment.
// The signature check proves the request really came from Stripe.
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not set" }, { status: 500 });

  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });

  const body = await req.text(); // raw body is required for the signature check
  let event: Stripe.Event;
  try {
    event = await getStripe().webhooks.constructEventAsync(body, signature, secret);
  } catch (err) {
    console.warn("Rejected webhook with bad signature", (err as Error).message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutCompleted(event.data.object);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await syncSubscription(event.data.object, event.data.object.metadata?.userId ?? null);
        break;
      default:
        break; // other events are acknowledged and ignored
    }
  } catch (err) {
    console.error(`Webhook ${event.type} failed`, err);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 }); // Stripe will retry
  }
  return NextResponse.json({ received: true });
}
