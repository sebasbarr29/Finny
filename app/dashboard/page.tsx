import type { Metadata } from "next";
import Link from "next/link";
import AppHeader from "@/app/components/AppHeader";
import { IconReport, IconUpload } from "@/app/components/icons";
import { requireUser } from "@/lib/auth";
import { money } from "@/lib/finance";
import { listReports } from "@/lib/reports";
import UploadForm from "./UploadForm";

export const metadata: Metadata = { title: "Dashboard | Finny" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const reports = await listReports(user.id);
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

        <div className="dash-grid">
          <section className="panel-card" aria-labelledby="upload-h">
            <div className="panel-card-h"><span className="ic g"><IconUpload /></span><h2 id="upload-h">New report</h2></div>
            <UploadForm />
            <div className="samples">
              <span>No file handy? Try the example clinic:</span>
              <a href="/samples/example-clinic-2026-09.csv" download>September CSV</a>
              <a href="/samples/example-clinic-2026-10.csv" download>October CSV</a>
            </div>
            <p className="disclaimer">Finny gives general business guidance, not tax, legal, or investment advice.</p>
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
