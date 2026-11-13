import "server-only";
import type { Language } from "./ai";
import { sql } from "./db";

export const BUSINESS_TYPES = [
  { value: "clinic", label: "Clinic or practice", prompt: "health clinic or practice" },
  { value: "shop", label: "Independent shop", prompt: "independent retail shop" },
  { value: "trades", label: "Trades or contractor", prompt: "trades or contracting business" },
  { value: "salon", label: "Salon or studio", prompt: "salon or studio" },
  { value: "food", label: "Café or restaurant", prompt: "café or restaurant" },
  { value: "services", label: "Consultant or freelancer", prompt: "consulting or freelance service business" },
  { value: "other", label: "Other small business", prompt: "small owner-operated business" },
] as const;

export type Settings = { businessName: string | null; businessType: string | null; language: Language };

export async function getSettings(userId: string): Promise<Settings> {
  const rows = await sql<{ business_name: string | null; business_type: string | null; preferred_language: string }>(
    "SELECT business_name, business_type, preferred_language FROM users WHERE id = $1",
    [userId],
  );
  const r = rows[0];
  return {
    businessName: r?.business_name ?? null,
    businessType: r?.business_type ?? null,
    language: r?.preferred_language === "es" ? "es" : "en",
  };
}

/** Business context for the AI: words only, never numbers. */
export function aiContext(s: Settings) {
  const type = BUSINESS_TYPES.find((t) => t.value === s.businessType)?.prompt ?? null;
  return { name: s.businessName, type };
}

export function businessTypeLabel(value: string | null): string | null {
  return BUSINESS_TYPES.find((t) => t.value === value)?.label ?? null;
}
