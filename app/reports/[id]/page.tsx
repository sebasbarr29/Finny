import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import AppHeader from "@/app/components/AppHeader";
import { IconAlert, IconBulb, IconReport, IconTodo, IconTrendUp } from "@/app/components/icons";
import { requireUser } from "@/lib/auth";
import { money, percent, points, type Change } from "@/lib/finance";
import { getReport } from "@/lib/reports";

export const metadata: Metadata = { title: "Report | Finny" };
export const dynamic = "force-dynamic";

const T = {
  en: {
    back: "Back to dashboard", monthly: "Monthly Report", tips: "Business Tips Report",
    revenue: "Revenue", expenses: "Expenses", profit: "Net profit", margin: "Profit margin",
    vs: "vs.", changed: "What changed", matters: "Why it matters", next: "What to do next",
    topExp: "Biggest expenses", ofExp: "of expenses", movers: "Biggest changes in expenses",
    profitA: "Profit", cash: "Cash flow", costs: "Costs", growth: "Growth",
    from: "From", sample: "Sample report",
    numbersNote: "All numbers were calculated by Finny directly from your file. The AI wrote the explanations using only those numbers.",
    disclaimer: "Finny gives general business guidance, not tax, legal, or investment advice. For those, talk to a qualified professional.",
  },
  es: {
    back: "Volver al panel", monthly: "Reporte mensual", tips: "Reporte de consejos para tu negocio",
    revenue: "Ingresos", expenses: "Gastos", profit: "Utilidad neta", margin: "Margen de utilidad",
    vs: "vs.", changed: "Qué cambió", matters: "Por qué importa", next: "Qué hacer ahora",
    topExp: "Gastos principales", ofExp: "de los gastos", movers: "Mayores cambios en gastos",
    profitA: "Utilidad", cash: "Flujo de caja", costs: "Costos", growth: "Crecimiento",
    from: "Archivos", sample: "Reporte de muestra",
    numbersNote: "Finny calculó todos los números directamente de tu archivo. La IA escribió las explicaciones usando solo esos números.",
    disclaimer: "Finny ofrece orientación general para negocios, no asesoría fiscal, legal ni de inversiones. Para eso, consulta a un profesional calificado.",
  },
};

function Delta({ c, invert = false }: { c?: Change; invert?: boolean }) {
  if (!c) return null;
  const good = invert ? c.abs < 0 : c.abs > 0;
  const cls = c.abs === 0 ? "flat" : good ? "up" : "down";
  return <span className={`chip ${cls}`}>{money(c.abs, true)}{c.pct !== null && ` (${percent(c.pct, true)})`}</span>;
}

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const report = await getReport(user.id, id);
  if (!report) notFound();

  const t = T[report.language];
  const m = report.metrics;
  const c = report.comparison;
  const mr = report.content.monthly_report;
  const tips = report.content.tips_report;
  const maxExp = Math.max(...m.topExpenses.map((e) => e.amount), 1);

  return (
    <>
      <AppHeader user={user} />
      <main className="dash wrap report" lang={report.language}>
        <Link className="back" href="/dashboard">← {t.back}</Link>

        <header className="report-head">
          <div>
            <p className="eyebrow">{report.is_sample ? t.sample : t.monthly}</p>
            <h1>{m.period}{report.previous_period && <span className="muted"> {t.vs} {report.previous_period}</span>}</h1>
            <p className="muted small">{t.from}: {report.source_files.join(", ")}</p>
          </div>
          <span className="pill">{report.language === "es" ? "Español" : "English"}</span>
        </header>

        <div className="kpis kpis-lg">
          <div className="kpi"><span className="k">{t.revenue}</span><span className="v num">{money(m.revenue)}</span><Delta c={c?.revenue} /></div>
          <div className="kpi"><span className="k">{t.expenses}</span><span className="v num">{money(m.expenses)}</span><Delta c={c?.expenses} invert /></div>
          <div className="kpi"><span className="k">{t.profit}</span><span className={`v num ${m.netProfit < 0 ? "neg" : ""}`}>{money(m.netProfit)}</span><Delta c={c?.netProfit} /></div>
          <div className="kpi">
            <span className="k">{t.margin}</span><span className="v num">{percent(m.marginPct)}</span>
            {c && c.marginPts !== null && <span className={`chip ${c.marginPts > 0 ? "up" : c.marginPts < 0 ? "down" : "flat"}`}>{points(c.marginPts)}</span>}
          </div>
        </div>

        <section className="panel-card" aria-labelledby="mr-h">
          <div className="panel-card-h"><span className="ic g"><IconReport /></span><h2 id="mr-h">{t.monthly}</h2></div>
          <p className="headline">{mr.headline}</p>
          <div className="mr-cols">
            <div className="mr-col">
              <h3><span className="ic g"><IconTrendUp /></span>{t.changed}</h3>
              <ul>{mr.what_changed.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>
            <div className="mr-col">
              <h3><span className="ic r"><IconAlert /></span>{t.matters}</h3>
              <ul>{mr.why_it_matters.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>
            <div className="mr-col">
              <h3><span className="ic b"><IconTodo /></span>{t.next}</h3>
              <ul>{mr.what_to_do_next.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>
          </div>
        </section>

        <div className="dash-grid even">
          <section className="panel-card" aria-labelledby="exp-h">
            <h2 id="exp-h">{t.topExp}</h2>
            <ul className="bars-list">
              {m.topExpenses.map((e) => (
                <li key={e.category}>
                  <div className="bl-row"><span>{e.category}</span><span className="num">{money(e.amount)} · {percent(e.sharePct)} {t.ofExp}</span></div>
                  <div className="bl-track"><i style={{ width: `${(e.amount / maxExp) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          </section>
          {c && c.categoryChanges.length > 0 && (
            <section className="panel-card" aria-labelledby="mv-h">
              <h2 id="mv-h">{t.movers}</h2>
              <div className="table-wrap">
                <table className="movers">
                  <tbody>
                    {c.categoryChanges.map((x) => (
                      <tr key={x.category}>
                        <td>{x.category}</td>
                        <td className="num muted">{money(x.previous)} → {money(x.current)}</td>
                        <td><span className={`chip ${x.abs > 0 ? "down" : "up"}`}>{money(x.abs, true)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>

        <section className="panel-card" aria-labelledby="tips-h">
          <div className="panel-card-h"><span className="ic a"><IconBulb /></span><h2 id="tips-h">{t.tips}</h2></div>
          <div className="tips-areas">
            {([
              ["profit", t.profitA, "var(--brand)"],
              ["cash_flow", t.cash, "var(--sky)"],
              ["costs", t.costs, "var(--rose)"],
              ["growth", t.growth, "var(--amber)"],
            ] as const).map(([key, label, color]) => (
              <div className="tip-area" key={key}>
                <h3><i style={{ background: color }} />{label}</h3>
                <ul>
                  {tips[key].map((tip, i) => (
                    <li key={i}><strong>{tip.title}</strong><span>{tip.detail}</span></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <p className="note">{t.numbersNote}</p>
        <p className="disclaimer">{t.disclaimer}</p>
      </main>
    </>
  );
}
