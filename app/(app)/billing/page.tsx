import type { Metadata } from "next";
import PageHeader from "@/app/components/PageHeader";
import { IconCheck, IconX } from "@/app/components/icons";
import { requireUser } from "@/lib/auth";
import { FREE_QUESTIONS, getPlan } from "@/lib/billing";
import { openBillingPortal, startCheckout } from "./actions";

export const metadata: Metadata = { title: "Billing | Finny" };
export const dynamic = "force-dynamic";

const NOTICES: Record<string, { cls: string; text: string }> = {
  canceled: { cls: "form-notice", text: "Checkout canceled. You weren't charged." },
  error: { cls: "form-error", text: "Couldn't open checkout. Please try again in a moment." },
  already: { cls: "form-notice", text: "You're already subscribed to Pro." },
  "portal-error": { cls: "form-error", text: "Couldn't open the Stripe billing page. In Stripe test mode, the customer portal must be turned on under Settings → Billing → Customer portal." },
  "no-customer": { cls: "form-error", text: "There's no Stripe subscription on this account yet." },
};

const ROWS: [string, string | boolean, string | boolean][] = [
  ["Monthly reports", "1 report", "Unlimited"],
  ["Business Tips and action plan", true, true],
  ["Ask Finny questions", `${FREE_QUESTIONS} questions`, "Unlimited (fair use)"],
  ["English and Spanish", true, true],
  ["Trends across months", true, true],
  ["Cancel anytime", "—", true],
];

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ billing?: string }> }) {
  const user = await requireUser();
  const [plan, { billing }] = await Promise.all([getPlan(user.id), searchParams]);
  const notice = billing ? NOTICES[billing] : undefined;
  const date = plan.currentPeriodEnd
    ? new Date(plan.currentPeriodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <div className="page">
      <PageHeader eyebrow="Billing" title="Plan & billing" description="See your current plan, compare plans, and manage your subscription." />
      {notice && <p className={notice.cls} role="status">{notice.text}</p>}

      <section className={`card current-plan ${plan.kind}`} aria-labelledby="cp-h">
        <div className="card-row">
          <div>
            <p className="label-green">Current plan</p>
            <h2 id="cp-h" className="card-title big">
              {plan.kind === "paid" ? "Pro · $29/month" : plan.kind === "demo" ? "Demo account" : "Free"}
            </h2>
          </div>
          <span className={`plan-badge ${plan.kind}`}>{plan.kind === "paid" ? "Active" : plan.kind === "demo" ? "Demo access" : "Free plan"}</span>
        </div>
        {plan.kind === "paid" && (
          <>
            <p className="muted">Unlimited reports and questions.{date && ` Your plan ${plan.cancelAtPeriodEnd ? "ends" : "renews"} on ${date}.`}</p>
            <form action={openBillingPortal}><button className="btn btn-secondary" type="submit">Manage subscription in Stripe</button></form>
          </>
        )}
        {plan.kind === "demo" && (
          <p className="muted">
            This is a demo account for testing Finny. It has full access without paying, and <strong>it is not a paid subscription</strong>.
            To try the free plan and Stripe checkout, sign up with a new account.
          </p>
        )}
        {plan.kind === "free" && (
          <>
            <ul className="usage">
              <li><span>Free report</span><strong>{plan.freeUsed} of 1 used</strong></li>
              <li><span>Ask Finny questions</span><strong>{FREE_QUESTIONS - plan.freeQuestionsLeft} of {FREE_QUESTIONS} used</strong></li>
            </ul>
            <form action={startCheckout}><button className="btn btn-primary" type="submit">Upgrade to Pro — $29/month</button></form>
            <p className="muted small">You&apos;ll pay securely on Stripe&apos;s checkout page. Test mode: use card 4242 4242 4242 4242.</p>
          </>
        )}
        {plan.kind !== "paid" && plan.status && plan.status !== "active" && <p className="muted small">Last subscription status: {plan.status.replace(/_/g, " ")}.</p>}
      </section>

      <section className="card" aria-labelledby="cmp-h">
        <h2 id="cmp-h" className="card-title">Compare plans</h2>
        <div className="table-wrap">
          <table className="data-table compare">
            <thead>
              <tr><th scope="col">Feature</th><th scope="col">Free</th><th scope="col">Pro · $29/month</th></tr>
            </thead>
            <tbody>
              {ROWS.map(([label, free, pro]) => (
                <tr key={label}>
                  <td>{label}</td>
                  {[free, pro].map((v, i) => (
                    <td key={i}>
                      {v === true ? <span className="yes"><IconCheck aria-hidden="true" /><span className="sr-only">Included</span></span>
                        : v === false ? <span className="no"><IconX aria-hidden="true" /><span className="sr-only">Not included</span></span>
                        : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
