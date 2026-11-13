import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getStripe } from "@/lib/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Setup check: reports which settings are present (never their values).
export async function GET() {
  const env = (name: string) => Boolean(process.env[name]?.trim());
  const secret = process.env.STRIPE_SECRET_KEY ?? "";

  let database = "ok";
  try {
    await sql("SELECT 1");
  } catch {
    database = "error";
  }

  let stripePrice = "not checked";
  if (secret && process.env.STRIPE_PRICE_ID) {
    try {
      const price = await getStripe().prices.retrieve(process.env.STRIPE_PRICE_ID.trim());
      stripePrice = price.recurring?.interval === "month" && price.unit_amount === 2900 ? "ok ($29/month)" : "found, but not $29/month";
    } catch (err) {
      stripePrice = `error: ${(err as { code?: string }).code ?? "could not load price"}`;
    }
  }

  return NextResponse.json({
    database,
    ANTHROPIC_API_KEY: env("ANTHROPIC_API_KEY"),
    STRIPE_SECRET_KEY: secret ? (secret.startsWith("sk_test_") ? "set (test mode)" : secret.startsWith("sk_live_") ? "set (LIVE mode)" : "set (unexpected format)") : false,
    STRIPE_PRICE_ID: env("STRIPE_PRICE_ID"),
    stripePrice,
    STRIPE_WEBHOOK_SECRET: env("STRIPE_WEBHOOK_SECRET"),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: env("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"),
  });
}
