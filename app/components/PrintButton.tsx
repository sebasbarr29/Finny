"use client";

import { IconPrinter } from "./icons";

export default function PrintButton({ label = "Print / Save PDF" }: { label?: string }) {
  return (
    <button type="button" className="btn btn-secondary" onClick={() => window.print()}>
      <IconPrinter aria-hidden="true" />
      {label}
    </button>
  );
}
