"use client";

import { usePathname, useRouter } from "next/navigation";

/** Month selector for pages that show one report at a time (tips, action plan). */
export default function ReportPicker({
  reports,
  selected,
  extra = "",
}: {
  reports: { id: string; label: string }[];
  selected: string;
  extra?: string;
}) {
  const router = useRouter();
  const path = usePathname();
  return (
    <label className="field picker">
      <span>Month</span>
      <select value={selected} onChange={(e) => router.push(`${path}?report=${e.target.value}${extra}`)}>
        {reports.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
      </select>
    </label>
  );
}
