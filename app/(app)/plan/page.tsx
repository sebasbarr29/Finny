import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/app/components/PageHeader";
import ReportPicker from "@/app/components/ReportPicker";
import { IconArrow } from "@/app/components/icons";
import { ensureActionItems, listActionItems } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { pickReport } from "@/lib/pick";
import { getReport, listReports } from "@/lib/reports";
import Checklist from "./Checklist";

export const metadata: Metadata = { title: "Action plan | Finny" };
export const dynamic = "force-dynamic";

export default async function PlanPage({ searchParams }: { searchParams: Promise<{ report?: string }> }) {
  const user = await requireUser();
  const { report: requested } = await searchParams;
  const list = await listReports(user.id);
  const { options, chosenId } = pickReport(list, requested);
  const report = chosenId ? await getReport(user.id, chosenId) : null;

  if (!report) {
    return (
      <div className="page">
        <PageHeader eyebrow="Action plan" title="Action plan" description="A monthly checklist built from your report, grouped by category and priority." />
        <section className="card empty-state">
          <h2 className="card-title">No action plan yet</h2>
          <p className="muted">Each report ends with next steps that become your checklist. Upload a month to get started.</p>
          <Link className="btn btn-primary" href="/upload">Upload a month</Link>
        </section>
      </div>
    );
  }

  await ensureActionItems(user.id, report.id, report.content);
  const items = await listActionItems(user.id, report.id);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Action plan"
        title={`Action plan · ${report.period_label}`}
        description="Your next steps from this month's report. Tick items off as you go — your progress is saved."
        actions={<ReportPicker reports={options} selected={report.id} />}
      />
      <Checklist items={items} />
      <div className="row-actions">
        <Link className="text-link" href={`/reports/${report.id}`}>Read the full report <IconArrow /></Link>
        <Link className="text-link" href={`/tips?report=${report.id}`}>Business tips <IconArrow /></Link>
      </div>
      <p className="disclaimer">Finny gives general business guidance, not tax, legal, or investment advice.</p>
    </div>
  );
}
