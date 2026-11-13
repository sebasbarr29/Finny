"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "@/app/(auth)/actions";
import {
  IconBulb, IconCard, IconChats, IconFileUp, IconGrid, IconListChecks, IconLogout, IconMenu, IconReport, IconSettings, IconX, LogoMark,
} from "./icons";

const MAIN = [
  { href: "/dashboard", label: "Dashboard", icon: IconGrid },
  { href: "/upload", label: "Upload", icon: IconFileUp },
  { href: "/reports", label: "Reports", icon: IconReport },
  { href: "/tips", label: "Business tips", icon: IconBulb },
  { href: "/plan", label: "Action plan", icon: IconListChecks },
  { href: "/ask", label: "Ask Finny", icon: IconChats },
];
const ACCOUNT = [
  { href: "/billing", label: "Billing", icon: IconCard },
  { href: "/settings", label: "Settings", icon: IconSettings },
];

type PlanBadge = { title: string; detail: string; kind: "free" | "paid" | "demo" };

function NavList({ items, path, onNavigate }: { items: typeof MAIN; path: string; onNavigate?: () => void }) {
  return (
    <ul className="nav-list">
      {items.map(({ href, label, icon: Icon }) => {
        const active = path === href || path.startsWith(href + "/");
        return (
          <li key={href}>
            <Link href={href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined} onClick={onNavigate}>
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default function AppShell({
  email,
  business,
  plan,
  children,
}: {
  email: string;
  business: string;
  plan: PlanBadge;
  children: React.ReactNode;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const sidebar = (onNavigate?: () => void) => (
    <>
      <nav aria-label="App">
        <NavList items={MAIN} path={path} onNavigate={onNavigate} />
        <p className="nav-group">Account</p>
        <NavList items={ACCOUNT} path={path} onNavigate={onNavigate} />
      </nav>
      <div className="side-bottom">
        <Link href="/billing" className={`side-plan ${plan.kind}`} onClick={onNavigate}>
          <strong>{plan.title}</strong>
          <span>{plan.detail}</span>
        </Link>
        <div className="side-user">
          <span className="avatar-sm" aria-hidden="true">{(business || email).slice(0, 2).toUpperCase()}</span>
          <span className="side-user-text"><strong>{business || "Your business"}</strong><span>{email}</span></span>
        </div>
        <form action={logout}>
          <button type="submit" className="side-logout"><IconLogout aria-hidden="true" />Log out</button>
        </form>
      </div>
    </>
  );

  return (
    <div className="app-shell">
      <aside className="app-side">
        <Link className="logo" href="/dashboard" aria-label="Finny dashboard"><LogoMark /><span>Finny</span></Link>
        {sidebar()}
      </aside>

      <header className="app-topbar">
        <Link className="logo" href="/dashboard" aria-label="Finny dashboard"><LogoMark /><span>Finny</span></Link>
        <div className="topbar-actions">
          {path !== "/upload" && <Link className="btn btn-primary btn-sm" href="/upload">Upload</Link>}
          <button
            type="button"
            className="icon-btn"
            aria-expanded={open}
            aria-controls="app-drawer"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </header>
      {open && <div className="drawer-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}
      <div id="app-drawer" className="app-drawer" hidden={!open}>
        {sidebar(() => setOpen(false))}
      </div>

      <main className="app-main" id="main">{children}</main>
    </div>
  );
}
