import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AuthForm from "../AuthForm";
import AuthShell from "../AuthShell";

export const metadata: Metadata = { title: "Log in | Finny" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ loggedOut?: string }> }) {
  if (await getCurrentUser()) redirect("/dashboard");
  const { loggedOut } = await searchParams;
  return (
    <AuthShell title="Welcome back" subtitle="Log in to see your reports.">
      <AuthForm mode="login" notice={loggedOut ? "You've been logged out." : undefined} />
    </AuthShell>
  );
}
