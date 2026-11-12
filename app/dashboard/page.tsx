import type { Metadata } from "next";
import AppHeader from "@/app/components/AppHeader";
import { IconReport, IconUpload } from "@/app/components/icons";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard | Finny" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const firstName = user.name?.trim() || user.email.split("@")[0];
  const memberSince = new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <AppHeader user={user} />
      <main className="dash wrap">
        <div className="dash-head">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Hi, {firstName}</h1>
            <p className="muted">Upload a monthly P&amp;L or bank CSV to get your Monthly Report and Business Tips Report.</p>
          </div>
        </div>

        <div className="dash-grid">
          <section className="panel-card" aria-labelledby="upload-h">
            <div className="panel-card-h"><span className="ic g"><IconUpload /></span><h2 id="upload-h">New report</h2></div>
            <p className="muted">CSV upload is being added to your dashboard next.</p>
          </section>

          <section className="panel-card" aria-labelledby="acct-h">
            <h2 id="acct-h">Your account</h2>
            <dl className="kv">
              <div><dt>Email</dt><dd>{user.email}</dd></div>
              {user.name && <div><dt>Name</dt><dd>{user.name}</dd></div>}
              <div><dt>Member since</dt><dd>{memberSince}</dd></div>
              <div><dt>Plan</dt><dd>Free (1 report included)</dd></div>
            </dl>
          </section>
        </div>

        <section className="panel-card" aria-labelledby="reports-h">
          <div className="panel-card-h"><span className="ic b"><IconReport /></span><h2 id="reports-h">Your reports</h2></div>
          <div className="empty">
            <p><strong>No reports yet.</strong></p>
            <p className="muted">Reports you create will appear here. Only you can see them.</p>
          </div>
        </section>
      </main>
    </>
  );
}
