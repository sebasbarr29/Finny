"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const STEPS = ["Reading your file…", "Calculating your numbers…", "Writing your Monthly Report…", "Writing your Business Tips Report…", "Almost done…"];

export default function UploadForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!busy) return;
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 9000);
    return () => clearInterval(t);
  }, [busy]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const current = form.get("current");
    if (!(current instanceof File) || current.size === 0) {
      setError("Choose a CSV file for this month.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/reports", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) { router.push("/login"); return; }
      if (!res.ok || !data.id) {
        setError(data.error ?? "Something went wrong while creating your report. Please try again.");
        setBusy(false);
        return;
      }
      router.push(`/reports/${data.id}`);
    } catch {
      setError("Couldn't reach Finny. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={onSubmit} noValidate>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="upload-grid">
        <label className="field">
          <span>This month&apos;s CSV</span>
          <input id="current" name="current" type="file" accept=".csv,text/csv" required disabled={busy} />
          <small>P&amp;L or bank export.</small>
        </label>
        <label className="field">
          <span>Previous month <em>(optional)</em></span>
          <input id="previous" name="previous" type="file" accept=".csv,text/csv" disabled={busy} />
          <small>Add it to see what changed.</small>
        </label>
      </div>
      <div className="upload-row">
        <label className="field lang-field">
          <span>Report language</span>
          <select id="language" name="language" defaultValue="en" disabled={busy}>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </label>
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Creating report…" : "Create report"}
        </button>
      </div>
      {busy && (
        <p className="progress" role="status" aria-live="polite">
          <span className="spinner" aria-hidden="true" />
          {STEPS[step]} This usually takes under a minute.
        </p>
      )}
    </form>
  );
}
