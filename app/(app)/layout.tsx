import AppShell from "@/app/components/AppShell";
import { requireUser } from "@/lib/auth";
import { getPlan } from "@/lib/billing";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [plan, settings] = await Promise.all([getPlan(user.id), getSettings(user.id)]);
  const badge =
    plan.kind === "paid"
      ? { kind: "paid" as const, title: "Pro plan", detail: "Unlimited monthly reports" }
      : plan.kind === "demo"
        ? { kind: "demo" as const, title: "Demo account", detail: "Full access for testing" }
        : { kind: "free" as const, title: "Free plan", detail: plan.freeLeft > 0 ? "1 free report available" : "Upgrade for more reports" };

  return (
    <AppShell email={user.email} business={settings.businessName ?? user.name ?? ""} plan={badge}>
      {children}
    </AppShell>
  );
}
