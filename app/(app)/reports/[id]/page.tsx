import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LangToggle from "@/app/components/LangToggle";
import PageHeader from "@/app/components/PageHeader";
import PrintButton from "@/app/components/PrintButton";
import ReportView from "@/app/components/ReportView";
import { IconArrow, IconBulb, IconListChecks } from "@/app/components/icons";
import { requireUser } from "@/lib/auth";
import { REPORT_T, type Lang } from "@/lib/i18n";
import { contentIn, getReport } from "@/lib/reports";

export const metadata: Metadata = { title: "Report | Finny" };
export const dynamic = "force-dynamic";

export default async function ReportPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ lang?: string }> }) {
  const user = await requireUser();
  const [{ id }, { lang: q }] = await Promise.all([params, searchParams]);
  const report = await getReport(user.id, id);
  if (!report) notFound();

  const wanted: Lang = q === "es" ? "es" : q === "en" ? "en" : report.language;
  const lang: Lang = contentIn(report, wanted) ? wanted : report.language;
  const content = contentIn(report, lang)!;
  const available = (["en", "es"] as const).filter((l) => contentIn(report, l));
  const t = REPORT_T.en;

  return (
    <div className="page">
      <Link className="back-link no-print" href="/reports">← All reports</Link>
      <PageHeader
        eyebrow={report.is_sample ? t.sample : t.monthly}
        title={<>{report.period_label}{report.previous_period && <span className="muted"> {t.vs} {report.previous_period}</span>}</>}
        description={`${t.from}: ${report.source_files.join(", ")} · Report written in ${lang === "es" ? "Spanish" : "English"}`}
        actions={
          <div className="no-print page-actions">
            <LangToggle reportId={report.id} current={lang} available={[...available]} />
            <PrintButton />
          </div>
        }
      />
      <ReportView lang={lang} metrics={report.metrics} comparison={report.comparison} content={content} />
      <div className="next-links no-print">
        <Link className="card link-card" href={`/tips?report=${report.id}&lang=${lang}`}>
          <span className="ic-tile amber"><IconBulb /></span>
          <span><strong>{t.tips}</strong><span className="muted">Recommendations for profit, cash flow, costs and growth</span></span>
          <IconArrow aria-hidden="true" />
        </Link>
        <Link className="card link-card" href={`/plan?report=${report.id}`}>
          <span className="ic-tile"><IconListChecks /></span>
          <span><strong>{t.plan}</strong><span className="muted">Your next steps as a checklist</span></span>
          <IconArrow aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
