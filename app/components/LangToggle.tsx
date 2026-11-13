"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

/**
 * English / Español switch for a saved report. If the report doesn't exist in the chosen
 * language yet, Finny writes it (about a minute) and saves it before switching.
 */
export default function LangToggle({
  reportId,
  current,
  available,
}: {
  reportId: string;
  current: "en" | "es";
  available: ("en" | "es")[];
}) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const [busy, setBusy] = useState<"en" | "es" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(lang: "en" | "es") {
    if (lang === current || busy) return;
    setError(null);
    const go = () => {
      const q = new URLSearchParams(params.toString());
      q.set("lang", lang);
      router.push(`${path}?${q.toString()}`);
      router.refresh();
    };
    if (available.includes(lang)) return go();
    setBusy(lang);
    try {
      const res = await fetch(`/api/reports/${reportId}/translate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ lang }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? "Couldn't switch the language. Please try again."); return; }
      go();
    } catch {
      setError("Couldn't reach Finny. Check your connection and try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="lang-toggle">
      <div className="seg" role="group" aria-label="Report language">
        {(["en", "es"] as const).map((l) => (
          <button key={l} type="button" aria-pressed={current === l} className={current === l ? "on" : undefined} disabled={!!busy} onClick={() => choose(l)}>
            {busy === l && <span className="spinner sm" aria-hidden="true" />}
            {l === "en" ? "English" : "Español"}
          </button>
        ))}
      </div>
      {busy && <p className="muted small" role="status">Writing the report in {busy === "es" ? "Spanish" : "English"}… about a minute.</p>}
      {error && <p className="form-error small" role="alert">{error}</p>}
    </div>
  );
}
