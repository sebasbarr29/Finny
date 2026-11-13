import type { Metadata } from "next";
import Link from "next/link";
import AppHeader from "@/app/components/AppHeader";
import { IconReport, IconUpload } from "@/app/components/icons";
import { requireUser } from "@/lib/auth";
import { getPlan } from "@/lib/billing";
import { startCheckout } from "@/app/billing/actions";
import { money } from "@/lib/finance";
import { listReports } from "@/lib/reports";
import UploadForm from "./UploadForm";

export const metadata: Metadata = { title: "Dashboard | Finny" };
export const dynamic = "force-dynamic";

const BILLING_NOTICES: Record<string, { cls: string; text: string }> = {
  canceled: { cls: "form-notice", text: "Checkout canceled. You weren't charged." },
  error: { cls: "form-error", text: "Couldn't open checkout. Please try again in a moment." },
  already: { cls: "form-notice", text: "You're already subscribed." },
};

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ billing?: string }> }) {
  const user = await requireUser();
  const [reports, plan, { billing }] = await Promise.all([listReports(user.id), getPlan(user.id), searchParams]);
  const notice = billing ? BILLING_NOTICES[billing] : undefined;
  const renews = plan.currentPeriodEnd
    ? new Date(plan.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;
  const firstName = user.name?.trim() || user.email.split("@")[0];
  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <AppHeader user={user} />
      <main className="dash wrap">
        <div className="dash-head">
          <p className="eyebrow">Dashboard</p>
          <h1>Hi, {firstName}</h1>
          <p className="muted">Upload a monthly P&amp;L or bank CSV to get your Monthly Report and Business Tips Report.</p>
        </div>

        {notice && <p className={notice.cls} role="status">{notice.text}</p>}

        <div className="dash-grid">
          <section className="panel-card" aria-labelledby="upload-h">
            <div className="panel-card-h"><span className="ic g"><IconUpload /></span><h2 id="upload-h">New report</h2></div>
            <UploadForm locked={!plan.canCreateReport} />
            <div className="samples">
              <span>No file handy? Try the example clinic:</span>
              <a href="/samples/example-clinic-2026-09.csv" download>September CSV</a>
              <a href="/samples/example-clinic-2026-10.csv" download>October CSV</a>
            </div>
            <p className="disclaimer">Finny gives general business guidance, not tax, legal, or investment advice.</p>
          </section>

          <div className="side-stack">
          <section className="panel-card plan-card" aria-labelledby="plan-h">
            <div className="plan-top">
              <h2 id="plan-h">Your plan</h2>
              <span className={`plan-badge ${plan.kind}`}>
                {plan.kind === "paid" ? "Finny · Active" : plan.kind === "demo" ? "Demo account" : "Free"}
              </span>
            </div>
            {plan.kind === "paid" && (
              <p className="muted">
                $29/month. Unlimited reports.
                {renews && (plan.cancelAtPeriodEnd ? ` Ends on ${renews}.` : ` Renews on ${renews}.`)}
              </p>
            )}
            {plan.kind === "demo" && (
              <p className="muted">Demo accounts can create reports without paying. Sign up with a new account to try the free report and checkout.</p>
            )}
            {plan.kind === "free" && (
              <>
                <p className="muted">
                  {plan.freeLeft > 0 ? "1 free report included. You haven't used it yet." : "You've used your free report."}
                </p>
                <div className="meter" aria-label={`${plan.freeUsed} of 1 free report used`}><i style={{ width: `${plan.freeUsed * 100}%` }} /></div>
                <form action={startCheckout}>
                  <button className="btn btn-primary btn-block" type="submit">Subscribe for $29/month</button>
                </form>
              </>
            )}
            {plan.kind !== "paid" && plan.status && plan.status !== "active" && (
              <p className="small muted">Last subscription status: {plan.status.replace(/_/g, " ")}.</p>
            )}
          </section>

          <section className="panel-card" aria-labelledby="acct-h">
            <h2 id="acct-h">Your account</h2>
            <dl className="kv">
              <div><dt>Email</dt><dd>{user.email}</dd></div>
              {user.name && <div><dt>Name</dt><dd>{user.name}</dd></div>}
              <div><dt>Member since</dt><dd>{memberSince}</dd></div>
              <div><dt>Reports</dt><dd>{reports.length}</dd></div>
            </dl>
            <details className="csv-help">
              <summary>What should my CSV look like?</summary>
              <p><strong>P&amp;L:</strong> columns <code>Category</code>, <code>Type</code> (Revenue or Expense), <code>Amount</code>.</p>
              <p><strong>Bank export:</strong> <code>Date</code>, <code>Description</code>, <code>Amount</code> (negative for money out), or separate <code>Debit</code> and <code>Credit</code> columns.</p>
            </details>
          </section>
          </div>
        </div>

        <section className="panel-card" aria-labelledby="reports-h">
          <div className="panel-card-h"><span className="ic b"><IconReport /></span><h2 id="reports-h">Your reports</h2></div>
          {reports.length === 0 ? (
            <div className="empty">
              <p><strong>No reports yet.</strong></p>
              <p className="muted">Upload a CSV above. Your reports are saved here, and only you can see them.</p>
            </div>
          ) : (
            <ul className="report-list">
              {reports.map((r) => (
                <li key={r.id}>
                  <Link href={`/reports/${r.id}`}>
                    <span className="rl-main">
                      <strong>{r.period_label}</strong>
                      <span className="muted">
                        {r.previous_period ? `Compared with ${r.previous_period}` : "Single month"} ·{" "}
                        {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </span>
                    <span className="rl-meta">
                      {r.is_sample && <span className="pill">Sample</span>}
                      <span className="pill">{r.language === "es" ? "Español" : "English"}</span>
                      <span className={`num ${r.net_profit < 0 ? "neg" : ""}`}>{money(r.net_profit)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
