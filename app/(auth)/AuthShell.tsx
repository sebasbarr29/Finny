import Link from "next/link";
import { LogoMark } from "@/app/components/icons";

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="auth-page">
      <div className="wrap auth-wrap">
        <Link className="logo" href="/"><LogoMark />Finny</Link>
        <div className="auth-card">
          <div className="auth-head">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
        </div>
        <p className="auth-foot">Built by <strong>Sebastián Barrantes</strong></p>
      </div>
    </div>
  );
}
