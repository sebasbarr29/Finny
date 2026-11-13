"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { sql } from "@/lib/db";
import { BUSINESS_TYPES } from "@/lib/settings";

export type SettingsState = { ok?: boolean; error?: string };

export async function saveSettings(_prev: SettingsState, form: FormData): Promise<SettingsState> {
  const user = await requireUser();
  const name = String(form.get("businessName") ?? "").trim().slice(0, 100);
  const type = String(form.get("businessType") ?? "");
  const lang = form.get("language") === "es" ? "es" : "en";
  if (type && !BUSINESS_TYPES.some((t) => t.value === type)) return { error: "Choose a business type from the list." };
  await sql("UPDATE users SET business_name = $2, business_type = $3, preferred_language = $4 WHERE id = $1", [
    user.id, name || null, type || null, lang,
  ]);
  revalidatePath("/", "layout");
  return { ok: true };
}
