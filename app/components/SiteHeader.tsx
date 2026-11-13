import Link from "next/link";
import { LogoMark } from "./icons";
import MobileNav from "./MobileNav";

export const SITE_LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/sample", label: "Sample report" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link className="logo" href={href} aria-label="Finny home">
      <LogoMark />
      <span>Finny</span>
    </Link>
  );
}

export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap site-header-inner">
        <Logo />
        <nav className="site-nav" aria-label="Main">
          {SITE_LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>
        <div className="site-actions">
          <Link className="link-quiet" href="/login">Log in</Link>
          <Link className="btn btn-primary" href="/signup">Get started</Link>
          <MobileNav links={SITE_LINKS} />
        </div>
      </div>
    </header>
  );
}
