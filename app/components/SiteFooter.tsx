import Link from "next/link";
import { Logo } from "./SiteHeader";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />
            <p>The monthly financial report for owners of clinics, shops, and small teams.</p>
            <p className="footer-built">Built by <strong>Sebastián Barrantes</strong></p>
          </div>
          <nav className="footer-col" aria-label="Product">
            <h3>Product</h3>
            <a href="/#how">How it works</a>
            <a href="/#features">Features</a>
            <Link href="/sample">Sample report</Link>
            <a href="/#pricing">Pricing</a>
            <a href="/#faq">FAQ</a>
          </nav>
          <nav className="footer-col" aria-label="Account">
            <h3>Account</h3>
            <Link href="/signup">Get started</Link>
            <Link href="/login">Log in</Link>
            <Link href="/dashboard">Dashboard</Link>
          </nav>
        </div>
        <div className="footer-bottom">
          <p>Finny gives general business guidance, not tax, legal, or investment advice.</p>
          <p>© 2026 Sebastián Barrantes</p>
        </div>
      </div>
    </footer>
  );
}
