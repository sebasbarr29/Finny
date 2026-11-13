import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/app/components/PageHeader";
import { IconFileUp } from "@/app/components/icons";
import { requireUser } from "@/lib/auth";
import { money, percent } from "@/lib/finance";
import { listReports } from "@/lib/reports";

export const metadata: Metadata = { title: "Reports | Finny" };
export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const user = await requireUser();
  const reports = await listReports(user.id);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Reports"
        title="Your monthly reports"
        description="Every report you've created, newest first. Only you can see them."
        actions={<Link className="btn btn-primary" href="/upload"><IconFileUp aria-hidden="true" />Upload a month</Link>}
      />
      {reports.length === 0 ? (
        <section className="card empty-state">
          <h2 className="card-title">No reports yet</h2>
          <p className="muted">Upload a monthly P&amp;L or bank export and your first report will appear here.</p>
          <Link className="btn btn-primary" href="/upload">Upload your first month</Link>
        </section>
      ) : (
        <ul className="report-cards">
          {reports.map((r) => (
            <li key={r.id}>
              <Link href={`/reports/${r.id}`} className="report-card">
                <div className="rc-top">
                  <div>
                    <h2>{r.period_label}</h2>
                    <p className="muted small">
                      {r.previous_period ? `Compared with ${r.previous_period}` : "Single month"} · Created{" "}
                      {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <span className="rc-tags">
                    {r.is_sample && <span className="pill">Sample</span>}
                    <span className="pill">{r.language === "es" ? "Spanish" : "English"}</span>
                  </span>
                </div>
                {r.headline && <p className="rc-summary" lang={r.headline_lang}>{r.headline}</p>}
                <dl className="rc-nums">
                  <div><dt>Revenue</dt><dd className="num">{money(r.revenue)}</dd></div>
                  <div><dt>Expenses</dt><dd className="num">{money(r.expenses)}</dd></div>
                  <div><dt>Net profit</dt><dd className={`num ${r.net_profit < 0 ? "neg" : ""}`}>{money(r.net_profit)}</dd></div>
                  <div><dt>Margin</dt><dd className="num">{percent(r.margin)}</dd></div>
                </dl>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
