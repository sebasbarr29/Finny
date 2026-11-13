import type { Metadata } from "next";
import PageHeader from "@/app/components/PageHeader";
import { requireUser } from "@/lib/auth";
import { BUSINESS_TYPES, getSettings } from "@/lib/settings";
import SettingsForm from "./SettingsForm";

export const metadata: Metadata = { title: "Settings | Finny" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const s = await getSettings(user.id);
  return (
    <div className="page narrow">
      <PageHeader eyebrow="Settings" title="Business settings" description="Finny uses these to tailor your reports and advice. They never change your numbers." />
      <SettingsForm
        email={user.email}
        initial={{ businessName: s.businessName ?? "", businessType: s.businessType ?? "", language: s.language }}
        types={BUSINESS_TYPES.map((t) => ({ value: t.value, label: t.label }))}
      />
    </div>
  );
}
