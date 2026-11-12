import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AuthForm from "../AuthForm";
import AuthShell from "../AuthShell";

export const metadata: Metadata = { title: "Sign up | Finny" };
export const dynamic = "force-dynamic";

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/dashboard");
  return (
    <AuthShell title="Create your Finny account" subtitle="Your first report is free. No card needed to sign up.">
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
