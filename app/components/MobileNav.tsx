"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconMenu, IconX } from "./icons";

export default function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="mobile-nav">
      <button
        type="button"
        className="icon-btn"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? <IconX /> : <IconMenu />}
      </button>
      <div id="mobile-menu" className="mobile-menu" hidden={!open}>
        <nav aria-label="Mobile">
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <Link href="/login" onClick={() => setOpen(false)}>Log in</Link>
        </nav>
        <Link className="btn btn-primary btn-block" href="/signup" onClick={() => setOpen(false)}>Start free — no card</Link>
      </div>
    </div>
  );
}
