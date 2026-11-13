import type { Metadata } from "next";
import Link from "next/link";
import ReportView from "@/app/components/ReportView";
import SiteFooter from "@/app/components/SiteFooter";
import SiteHeader from "@/app/components/SiteHeader";
import { IconArrow } from "@/app/components/icons";
import { REPORT_T, type Lang } from "@/lib/i18n";
import { getSampleReport } from "@/lib/reports";

export const metadata: Metadata = { title: "Sample report | Finny" };
export const dynamic = "force-dynamic";

export default async function SamplePage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang: q } = await searchParams;
  const lang: Lang = q === "es" ? "es" : "en";
  const report = await getSampleReport(lang).catch(() => null);
  const t = REPORT_T.en;

  return (
    <>
      <SiteHeader />
      <main className="wrap sample-page">
        <div className="page-head">
          <div>
            <p className="eyebrow-line"><span aria-hidden="true" />{t.sample}</p>
            <h1>
              {report ? report.period_label : "October 2026"}
              {report?.previous_period && <span className="muted"> {t.vs} {report.previous_period}</span>}
            </h1>
            <p className="muted">
              {`A real Finny report for an example clinic, created from our sample CSV files. The numbers are example data.${lang === "es" ? " This version of the report is written in Spanish." : ""}`}
            </p>
          </div>
          <div className="page-actions">
            <div className="seg" role="group" aria-label="Report language">
              <Link href="/sample" aria-current={lang === "en" ? "true" : undefined} className={lang === "en" ? "on" : undefined}>English</Link>
              <Link href="/sample?lang=es" aria-current={lang === "es" ? "true" : undefined} className={lang === "es" ? "on" : undefined}>Spanish</Link>
            </div>
          </div>
        </div>

        {report ? (
          <ReportView lang={lang} metrics={report.metrics} comparison={report.comparison} content={report.content} showTips />
        ) : (
          <div className="card empty-state">
            <h2>The sample report isn&apos;t available right now</h2>
            <p className="muted">Please try again in a moment, or sign up and upload the sample files yourself.</p>
          </div>
        )}

        <div className="final-cta sample-cta">
          <h2>Get this report for your own business</h2>
          <p>Your first report is free. No card needed.</p>
          <Link className="btn btn-primary btn-lg" href="/signup">Start free — no card <IconArrow /></Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
