import type { Metadata } from "next";
import Link from "next/link";
import LineChart from "@/app/components/LineChart";
import PageHeader from "@/app/components/PageHeader";
import { KpiCards } from "@/app/components/ReportView";
import { IconArrow, IconChats, IconCheck, IconFileUp, IconListChecks, IconReport, IconSparkle } from "@/app/components/icons";
import { actionProgress, ensureActionItems, listActionItems } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { getPlan } from "@/lib/billing";
import type { Comparison } from "@/lib/finance";
import { localPeriod, periodKey, shortMonth } from "@/lib/i18n";
import { getReport, latestByMonth, listReports, monthSeries } from "@/lib/reports";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Dashboard | Finny" };
export const dynamic = "force-dynamic";

const SUGGESTED = ["Why did my profit change?", "Which expense grew the most?", "How did revenue compare with last month?"];

export default async function DashboardPage() {
  const user = await requireUser();
  const [reports, plan, settings, series] = await Promise.all([listReports(user.id), getPlan(user.id), getSettings(user.id), monthSeries(user.id)]);
  const business = settings.businessName || user.name || "your business";
  const latestSummary = latestByMonth(reports);

  if (!latestSummary) {
    return (
      <div className="page">
        <PageHeader
          eyebrow="Dashboard"
          title={`Welcome to Finny, ${business}`}
          description="Upload one month of numbers to get your first report. It takes about two minutes."
          actions={<Link className="btn btn-primary" href="/upload"><IconFileUp aria-hidden="true" />Upload your first month</Link>}
        />
        <section className="card onboarding" aria-labelledby="ob-h">
          <h2 id="ob-h" className="card-title">Get your first report in three steps</h2>
          <ol className="ob-steps">
            <li><span className="ic-tile"><IconFileUp /></span><div><strong>Upload a spreadsheet</strong><p className="muted">A monthly P&amp;L or bank export, as CSV or Excel. Add last month too to see what changed.</p></div></li>
            <li><span className="ic-tile"><IconSparkle /></span><div><strong>Review your report</strong><p className="muted">Finny calculates your numbers, then explains what changed, why it matters and what to do next.</p></div></li>
            <li><span className="ic-tile"><IconListChecks /></span><div><strong>Follow your action plan</strong><p className="muted">Next steps become a checklist with priorities. Tick them off as you go.</p></div></li>
          </ol>
          <div className="ob-actions">
            <Link className="btn btn-primary" href="/upload">Upload a file</Link>
            <span className="muted">No file handy? Try the sample clinic: <a href="/samples/example-clinic-2026-09.csv" download>September</a> · <a href="/samples/example-clinic-2026-10.csv" download>October</a></span>
          </div>
        </section>
        <PlanCard plan={plan} />
      </div>
    );
  }

  const latest = await getReport(user.id, latestSummary.id);
  if (latest) await ensureActionItems(user.id, latest.id, latest.content);
  const [progress, items] = latest
    ? await Promise.all([actionProgress(user.id, latest.id), listActionItems(user.id, latest.id)])
    : [{ done: 0, total: 0 }, []];
  const openItems = items.filter((i) => !i.done).slice(0, 3);

  // If the latest report was a single-month upload, compare with the previous saved month instead.
  let kpiComparison: Comparison | null = latest?.comparison ?? null;
  if (latest && !kpiComparison) {
    const prev = [...series].reverse().find((p) => periodKey(p.period) < periodKey(latest.period_label));
    if (prev) {
      const ch = (cur: number, before: number) => ({
        abs: Math.round((cur - before) * 100) / 100,
        pct: before === 0 ? null : Math.round(((cur - before) / Math.abs(before)) * 1000) / 10,
      });
      const prevMargin = prev.revenue === 0 ? null : Math.round((prev.netProfit / prev.revenue) * 1000) / 10;
      kpiComparison = {
        previousPeriod: prev.period,
        previous: { revenue: prev.revenue, expenses: prev.expenses, netProfit: prev.netProfit, marginPct: prevMargin },
        revenue: ch(latest.metrics.revenue, prev.revenue),
        expenses: ch(latest.metrics.expenses, prev.expenses),
        netProfit: ch(latest.metrics.netProfit, prev.netProfit),
        marginPts: latest.metrics.marginPct === null || prevMargin === null ? null : Math.round((latest.metrics.marginPct - prevMargin) * 10) / 10,
        categoryChanges: [],
      };
    }
  }
  const content = latest ? (latest.language === settings.language ? latest.content : latest.translations?.[settings.language] ?? latest.content) : null;

  return (
    <div className="page">
      <PageHeader
        eyebrow="Dashboard"
        title={`Hi, ${business}`}
        description={`Your latest numbers are for ${latestSummary.period_label}. Here's where things stand.`}
        actions={
          <>
            <Link className="btn btn-secondary" href="/ask"><IconChats aria-hidden="true" />Ask Finny</Link>
            <Link className="btn btn-primary" href="/upload"><IconFileUp aria-hidden="true" />Upload a month</Link>
          </>
        }
      />

      {latest && <KpiCards m={latest.metrics} c={kpiComparison} lang="en" />}

      <div className="dash-grid-2">
        <section className="card" aria-labelledby="trend-h">
          <div className="chart-head">
            <h2 id="trend-h" className="card-title">Revenue vs expenses</h2>
            <span className="legend">
              <span><i className="sw solid" />Revenue</span>
              <span><i className="sw dashed" />Expenses</span>
            </span>
          </div>
          {series.length >= 2 ? (
            <>
              <LineChart
                labels={series.map((p) => shortMonth(p.period))}
                showYAxis
                ariaLabel={`Revenue and expenses by month: ${series.map((p) => `${p.period} revenue $${Math.round(p.revenue).toLocaleString("en-US")}, expenses $${Math.round(p.expenses).toLocaleString("en-US")}`).join("; ")}.`}
                series={[
                  { label: "Revenue", values: series.map((p) => p.revenue), color: "var(--brand)", area: true },
                  { label: "Expenses", values: series.map((p) => p.expenses), color: "var(--sky)", dashed: true },
                ]}
              />
              <p className="fine-print">{series.length} months on file · {series[0].period} to {series[series.length - 1].period}</p>
            </>
          ) : (
            <div className="empty-inline">
              <p><strong>Your trend appears after two months.</strong></p>
              <p className="muted">Upload another month (or two months at once) to see revenue and expenses over time.</p>
              <Link className="btn btn-secondary btn-sm" href="/upload">Upload another month</Link>
            </div>
          )}
        </section>

        {latest && content && (
          <section className="card latest-card" aria-labelledby="latest-h">
            <p className="label-green">Latest report</p>
            <h2 id="latest-h" className="card-title">{localPeriod(latest.period_label, "en")}{latest.previous_period ? ` vs ${latest.previous_period}` : ""}</h2>
            <p className="latest-text">{content.monthly_report.headline}</p>
            {content.monthly_report.what_to_do_next[0] && (
              <p className="latest-next"><strong>Next:</strong> {content.monthly_report.what_to_do_next[0]}</p>
            )}
            <div className="row-actions">
              <Link className="text-link" href={`/reports/${latest.id}`}>Read the full report <IconArrow /></Link>
              <Link className="text-link quiet" href={`/tips?report=${latest.id}`}>Business tips</Link>
            </div>
          </section>
        )}
      </div>

      <div className="dash-grid-3">
        <section className="card" aria-labelledby="ap-h">
          <div className="card-row">
            <h2 id="ap-h" className="card-title">Action plan</h2>
            <span className="muted small">{progress.done} of {progress.total} done</span>
          </div>
          <div className="pbar" role="progressbar" aria-valuemin={0} aria-valuemax={progress.total} aria-valuenow={progress.done} aria-label="Action plan progress">
            <i style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} />
          </div>
          {openItems.length ? (
            <ul className="mini-list">
              {openItems.map((i) => (
                <li key={i.id}><span className={`prio ${i.priority}`}>{i.priority[0].toUpperCase() + i.priority.slice(1)}</span>{i.task}</li>
              ))}
            </ul>
          ) : (
            <p className="muted"><IconCheck aria-hidden="true" className="inline-ic" /> Everything for this month is done.</p>
          )}
          <Link className="text-link" href={latest ? `/plan?report=${latest.id}` : "/plan"}>Open action plan <IconArrow /></Link>
        </section>

        <section className="card" aria-labelledby="ask-h">
          <h2 id="ask-h" className="card-title">Ask Finny</h2>
          <p className="muted">Questions answered only from your saved numbers.</p>
          <ul className="suggest-list">
            {SUGGESTED.map((q) => (
              <li key={q}><Link href={`/ask?q=${encodeURIComponent(q)}`}>{q}</Link></li>
            ))}
          </ul>
        </section>

        <PlanCard plan={plan} />
      </div>

      <section className="card" aria-labelledby="recent-h">
        <div className="card-row">
          <h2 id="recent-h" className="card-title">Recent reports</h2>
          <Link className="text-link" href="/reports">All reports <IconArrow /></Link>
        </div>
        <ul className="report-rows">
          {reports.slice(0, 3).map((r) => (
            <li key={r.id}>
              <Link href={`/reports/${r.id}`}>
                <span className="ic-tile sm"><IconReport /></span>
                <span className="rr-main"><strong>{r.period_label}</strong><span className="muted">{r.previous_period ? `Compared with ${r.previous_period}` : "Single month"}</span></span>
                <span className="pill">{r.language === "es" ? "Español" : "English"}</span>
                <span className={`num rr-profit ${r.net_profit < 0 ? "neg" : ""}`}>${Math.round(r.net_profit).toLocaleString("en-US")} <span className="muted">profit</span></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function PlanCard({ plan }: { plan: Awaited<ReturnType<typeof getPlan>> }) {
  return (
    <section className="card" aria-labelledby="plan-h">
      <div className="card-row">
        <h2 id="plan-h" className="card-title">Your plan</h2>
        <span className={`plan-badge ${plan.kind}`}>{plan.kind === "paid" ? "Pro · Active" : plan.kind === "demo" ? "Demo account" : "Free"}</span>
      </div>
      {plan.kind === "paid" && <p className="muted">Unlimited reports and questions. {plan.currentPeriodEnd ? `${plan.cancelAtPeriodEnd ? "Ends" : "Renews"} on ${new Date(plan.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.` : ""}</p>}
      {plan.kind === "demo" && <p className="muted">Demo access for testing. It isn&apos;t a paid subscription.</p>}
      {plan.kind === "free" && (
        <p className="muted">
          {plan.freeLeft > 0 ? "Your free report is ready to use." : "You've used your free report."} {plan.freeQuestionsLeft} of 5 free questions left.
        </p>
      )}
      <Link className="text-link" href="/billing">{plan.kind === "free" ? "See Pro" : "Manage billing"} <IconArrow /></Link>
    </section>
  );
}
