"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";
import { sql } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

export type FormState = { error?: string; email?: string; name?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function signup(_prev: FormState, form: FormData): Promise<FormState> {
  const name = String(form.get("name") ?? "").trim().slice(0, 100);
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!EMAIL_RE.test(email) || email.length > 254) return { error: "Enter a valid email address.", email, name };
  if (password.length < 8) return { error: "Use a password with at least 8 characters.", email, name };
  if (password.length > 200) return { error: "That password is too long. Use 200 characters or fewer.", email, name };

  const existing = await sql("SELECT 1 FROM users WHERE email = $1", [email]);
  if (existing.length) return { error: "An account with this email already exists. Log in instead.", email, name };

  const hash = await hashPassword(password);
  const rows = await sql<{ id: string }>(
    `INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3)
     ON CONFLICT (email) DO NOTHING RETURNING id::text AS id`,
    [email, name || null, hash],
  );
  if (!rows[0]) return { error: "An account with this email already exists. Log in instead.", email, name };

  await createSession(rows[0].id);
  redirect("/dashboard");
}

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password.", email };

  const rows = await sql<{ id: string; password_hash: string }>(
    "SELECT id::text AS id, password_hash FROM users WHERE email = $1",
    [email],
  );
  const user = rows[0];
  const ok = user ? await verifyPassword(password, user.password_hash) : false;
  if (!user || !ok) return { error: "That email and password don't match an account.", email };

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login?loggedOut=1");
}
