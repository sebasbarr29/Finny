import type { Metadata } from "next";
import Link from "next/link";
import LangToggle from "@/app/components/LangToggle";
import PageHeader from "@/app/components/PageHeader";
import ReportPicker from "@/app/components/ReportPicker";
import { TipsGrid } from "@/app/components/ReportView";
import { IconArrow } from "@/app/components/icons";
import { requireUser } from "@/lib/auth";
import { localPeriod, REPORT_T, type Lang } from "@/lib/i18n";
import { pickReport } from "@/lib/pick";
import { contentIn, getReport, listReports } from "@/lib/reports";

export const metadata: Metadata = { title: "Business tips | Finny" };
export const dynamic = "force-dynamic";

export default async function TipsPage({ searchParams }: { searchParams: Promise<{ report?: string; lang?: string }> }) {
  const user = await requireUser();
  const { report: requested, lang: q } = await searchParams;
  const list = await listReports(user.id);
  const { options, chosenId } = pickReport(list, requested);
  const report = chosenId ? await getReport(user.id, chosenId) : null;

  if (!report) {
    return (
      <div className="page">
        <PageHeader eyebrow="Business tips" title="Business tips" description="Practical recommendations for profit, cash flow, costs and growth, based on your numbers." />
        <section className="card empty-state">
          <h2 className="card-title">No tips yet</h2>
          <p className="muted">Tips come with every report. Upload a month to get your first set.</p>
          <Link className="btn btn-primary" href="/upload">Upload a month</Link>
        </section>
      </div>
    );
  }

  const wanted: Lang = q === "es" ? "es" : q === "en" ? "en" : report.language;
  const lang: Lang = contentIn(report, wanted) ? wanted : report.language;
  const content = contentIn(report, lang)!;
  const t = REPORT_T[lang];

  return (
    <div className="page">
      <PageHeader
        eyebrow="Business tips"
        title={`${t.tips} · ${localPeriod(report.period_label, lang)}`}
        description={lang === "es" ? "Recomendaciones prácticas basadas en los números de este mes." : "Practical recommendations based on this month's numbers."}
        actions={
          <>
            <ReportPicker reports={options} selected={report.id} />
            <LangToggle reportId={report.id} current={lang} available={(["en", "es"] as const).filter((l) => contentIn(report, l))} />
          </>
        }
      />
      <TipsGrid tips={content.tips_report} lang={lang} />
      <div className="row-actions">
        <Link className="text-link" href={`/reports/${report.id}?lang=${lang}`}>{lang === "es" ? "Ver el reporte completo" : "Read the full report"} <IconArrow /></Link>
        <Link className="text-link" href={`/plan?report=${report.id}`}>{t.plan} <IconArrow /></Link>
      </div>
      <p className="disclaimer">{t.disclaimer}</p>
    </div>
  );
}
