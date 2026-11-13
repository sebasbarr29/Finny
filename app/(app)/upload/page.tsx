import type { Metadata } from "next";
import PageHeader from "@/app/components/PageHeader";
import { requireUser } from "@/lib/auth";
import { getPlan } from "@/lib/billing";
import { getSettings } from "@/lib/settings";
import UploadFlow from "./UploadFlow";

export const metadata: Metadata = { title: "Upload | Finny" };
export const dynamic = "force-dynamic";

export default async function UploadPage() {
  const user = await requireUser();
  const [plan, settings] = await Promise.all([getPlan(user.id), getSettings(user.id)]);
  return (
    <div className="page">
      <PageHeader
        eyebrow="Upload"
        title="Upload a month"
        description="Add a monthly P&L or bank export. Finny reads the numbers, shows them to you, then writes your report."
      />
      <UploadFlow locked={!plan.canCreateReport} defaultLanguage={settings.language} />
    </div>
  );
}
