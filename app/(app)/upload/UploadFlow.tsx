"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { startCheckout } from "@/app/(app)/billing/actions";
import { IconAlert, IconArrow, IconCheck, IconFileUp, IconLock } from "@/app/components/icons";

type Preview = {
  file: string;
  period: string;
  revenue: number;
  expenses: number;
  netProfit: number;
  marginPct: number | null;
  topExpenses: { category: string; amount: number; sharePct: number }[];
  rowsUsed: number;
  rowsSkipped: number;
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const STEPS = ["Reading your file…", "Checking the numbers…", "Writing your Monthly Report…", "Writing your Business Tips…", "Building your action plan…", "Almost done…"];

const money = (n: number) => `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

/** "October 2026" -> "2026-10" for the month picker. */
function toYm(label: string): string {
  const i = MONTHS.findIndex((m) => label.startsWith(m));
  const y = label.match(/(20\d{2})/)?.[1];
  return i >= 0 && y ? `${y}-${String(i + 1).padStart(2, "0")}` : "";
}

function monthOptions(): { value: string; label: string }[] {
  const now = new Date();
  const out: { value: string; label: string }[] = [];
  for (let k = 0; k < 36; k++) {
    const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
    out.push({ value: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`, label: `${MONTHS[d.getMonth()]} ${d.getFullYear()}` });
  }
  return out;
}

function MonthSelect({ id, value, onChange, label }: { id: string; value: string; onChange: (v: string) => void; label: string }) {
  const options = useMemo(monthOptions, []);
  const hasValue = !value || options.some((o) => o.value === value);
  return (
    <label className="field">
      <span>{label}</span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Detect from file</option>
        {!hasValue && <option value={value}>{value}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

export default function UploadFlow({ locked, defaultLanguage }: { locked: boolean; defaultLanguage: "en" | "es" }) {
  const router = useRouter();
  const [stage, setStage] = useState<"choose" | "review" | "generating">("choose");
  const [current, setCurrent] = useState<File | null>(null);
  const [previous, setPrevious] = useState<File | null>(null);
  const [curMonth, setCurMonth] = useState("");
  const [prevMonth, setPrevMonth] = useState("");
  const [language, setLanguage] = useState<"en" | "es">(defaultLanguage);
  const [preview, setPreview] = useState<{ current: Preview; previous: Preview | null; warnings: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [needsSub, setNeedsSub] = useState(locked);

  useEffect(() => {
    if (stage !== "generating") return;
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 9000);
    return () => clearInterval(t);
  }, [stage]);

  function formData(): FormData {
    const fd = new FormData();
    if (current) fd.append("current", current);
    if (previous) fd.append("previous", previous);
    if (curMonth) fd.append("current_period", curMonth);
    if (prevMonth) fd.append("previous_period", prevMonth);
    fd.append("language", language);
    return fd;
  }

  async function readFiles(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!current) { setError("Choose a file for this month."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/reports/preview", { method: "POST", body: formData() });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) { router.push("/login"); return; }
      if (!res.ok) { setError(data.error ?? "Couldn't read that file. Please try again."); return; }
      setPreview(data);
      if (!curMonth) setCurMonth(toYm(data.current.period));
      if (data.previous && !prevMonth) setPrevMonth(toYm(data.previous.period));
      setStage("review");
    } catch {
      setError("Couldn't reach Finny. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    setError(null);
    setStage("generating");
    try {
      const res = await fetch("/api/reports", { method: "POST", body: formData() });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) { router.push("/login"); return; }
      if (res.status === 402 && data.needsSubscription) { setNeedsSub(true); return; }
      if (!res.ok || !data.id) {
        setError(data.error ?? "Something went wrong while creating your report. Please try again.");
        setStage("review");
        return;
      }
      router.push(`/reports/${data.id}`);
      router.refresh();
    } catch {
      setError("Couldn't reach Finny. Check your connection and try again.");
      setStage("review");
    }
  }

  if (needsSub) {
    return (
      <section className="card paywall-card" aria-labelledby="pw-h">
        <span className="ic-tile"><IconLock /></span>
        <h2 id="pw-h" className="card-title">You&apos;ve used your free report</h2>
        <p className="muted">Pro is $29/month for unlimited monthly reports and Ask Finny questions. Cancel anytime.</p>
        <form action={startCheckout}><button className="btn btn-primary" type="submit">Upgrade to Pro</button></form>
      </section>
    );
  }

  const stepIndex = stage === "choose" ? 0 : stage === "review" ? 1 : 2;

  return (
    <div className="upload">
      <ol className="stepper" aria-label="Upload progress">
        {["Choose file", "Review numbers", "Get report"].map((s, i) => (
          <li key={s} className={i < stepIndex ? "done" : i === stepIndex ? "current" : undefined} aria-current={i === stepIndex ? "step" : undefined}>
            <span className="stepper-dot">{i < stepIndex ? <IconCheck aria-hidden="true" /> : i + 1}</span>{s}
          </li>
        ))}
      </ol>

      {error && <p className="form-error" role="alert"><IconAlert aria-hidden="true" />{error}</p>}

      {stage === "choose" && (
        <form className="card upload-card" onSubmit={readFiles} noValidate>
          <div className="upload-files">
            <div className="file-block">
              <label className={`dropzone ${current ? "has-file" : ""}`} htmlFor="current">
                <IconFileUp aria-hidden="true" />
                <strong>{current ? current.name : "This month's file"}</strong>
                <span className="muted">{current ? `${(current.size / 1024).toFixed(1)} KB · click to change` : "CSV or Excel (.xlsx), up to 2 MB"}</span>
              </label>
              <input id="current" className="sr-only" type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => { setCurrent(e.target.files?.[0] ?? null); setPreview(null); }} />
              <MonthSelect id="current_period" label="Which month is this?" value={curMonth} onChange={setCurMonth} />
            </div>
            <div className="file-block">
              <label className={`dropzone soft ${previous ? "has-file" : ""}`} htmlFor="previous">
                <IconFileUp aria-hidden="true" />
                <strong>{previous ? previous.name : "Previous month (optional)"}</strong>
                <span className="muted">{previous ? "click to change" : "Add it to see what changed"}</span>
              </label>
              <input id="previous" className="sr-only" type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={(e) => { setPrevious(e.target.files?.[0] ?? null); setPreview(null); }} />
              {previous && <MonthSelect id="previous_period" label="Which month is this?" value={prevMonth} onChange={setPrevMonth} />}
              {previous && <button type="button" className="link-btn" onClick={() => { setPrevious(null); setPrevMonth(""); }}>Remove previous month</button>}
            </div>
          </div>
          <div className="upload-row">
            <label className="field lang-field">
              <span>Report language</span>
              <select id="language" value={language} onChange={(e) => setLanguage(e.target.value as "en" | "es")}>
                <option value="en">English</option>
                <option value="es">Spanish</option>
              </select>
            </label>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? <><span className="spinner" aria-hidden="true" />Reading…</> : <>Read my file <IconArrow /></>}
            </button>
          </div>
          <details className="csv-help">
            <summary>What should my file look like?</summary>
            <p><strong>P&amp;L:</strong> columns <code>Category</code>, <code>Type</code> (Revenue or Expense) and <code>Amount</code>.</p>
            <p><strong>Bank export:</strong> <code>Date</code>, <code>Description</code> and <code>Amount</code> (negative for money out), or separate <code>Debit</code> and <code>Credit</code> columns.</p>
            <p>No file handy? Try the sample clinic: <a href="/samples/example-clinic-2026-09.csv" download>September</a> · <a href="/samples/example-clinic-2026-10.csv" download>October</a></p>
          </details>
        </form>
      )}

      {stage !== "choose" && preview && (
        <div className="review">
          <div className={`review-grid ${preview.previous ? "two" : ""}`}>
            {[preview.current, preview.previous].filter(Boolean).map((p, i) => (
              <section className="card" key={i} aria-label={i === 0 ? "This month" : "Previous month"}>
                <div className="card-row">
                  <div>
                    <p className="label-green">{i === 0 ? "This month" : "Previous month"}</p>
                    <h2 className="card-title">{p!.period}</h2>
                    <p className="muted small">{p!.file} · {p!.rowsUsed} line{p!.rowsUsed === 1 ? "" : "s"} read{p!.rowsSkipped ? ` · ${p!.rowsSkipped} skipped` : ""}</p>
                  </div>
                </div>
                <dl className="review-nums">
                  <div><dt>Revenue</dt><dd className="num">{money(p!.revenue)}</dd></div>
                  <div><dt>Expenses</dt><dd className="num">{money(p!.expenses)}</dd></div>
                  <div><dt>Net profit</dt><dd className={`num ${p!.netProfit < 0 ? "neg" : ""}`}>{money(p!.netProfit)}</dd></div>
                  <div><dt>Profit margin</dt><dd className="num">{p!.marginPct === null ? "n/a" : `${p!.marginPct.toFixed(1)}%`}</dd></div>
                </dl>
                <p className="mk-sub">Biggest expenses</p>
                <ul className="review-top">
                  {p!.topExpenses.map((e) => <li key={e.category}><span>{e.category}</span><span className="num">{money(e.amount)}</span></li>)}
                </ul>
              </section>
            ))}
          </div>

          {preview.warnings.length > 0 && (
            <div className="warn-box" role="status">
              <IconAlert aria-hidden="true" />
              <ul>{preview.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
            </div>
          )}

          {stage === "review" && (
            <div className="card review-actions">
              <div className="month-pickers">
                <MonthSelect id="r_current_period" label="This month" value={curMonth} onChange={setCurMonth} />
                {preview.previous && <MonthSelect id="r_previous_period" label="Previous month" value={prevMonth} onChange={setPrevMonth} />}
                <label className="field lang-field">
                  <span>Report language</span>
                  <select value={language} onChange={(e) => setLanguage(e.target.value as "en" | "es")}>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                  </select>
                </label>
              </div>
              <p className="muted small">If these numbers look right, generate your report. Finny&apos;s AI will only use the numbers above.</p>
              <div className="row-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setStage("choose")}>Back</button>
                <button type="button" className="btn btn-primary" onClick={generate}>Generate report <IconArrow /></button>
              </div>
            </div>
          )}

          {stage === "generating" && (
            <div className="card generating" role="status" aria-live="polite">
              <span className="spinner lg" aria-hidden="true" />
              <div>
                <strong>{STEPS[step]}</strong>
                <p className="muted">This usually takes about a minute. You can stay on this page.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
