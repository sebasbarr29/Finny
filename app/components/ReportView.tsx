import type { AiReport } from "@/lib/ai";
import { money, percent, points, type Change, type Comparison, type Metrics } from "@/lib/finance";
import { REPORT_T, type Lang } from "@/lib/i18n";
import { IconAlert, IconArrowDown, IconArrowUp, IconBulb, IconReport, IconTodo, IconTrendUp } from "./icons";

/** Change chip with an arrow icon and words, so meaning never depends on color alone. */
export function Delta({ c, invert = false, suffix }: { c?: Change | null; invert?: boolean; lang?: Lang; suffix?: string }) {
  if (!c) return null;
  const t = REPORT_T.en;
  const good = invert ? c.abs < 0 : c.abs > 0;
  const tone = c.abs === 0 ? "flat" : good ? "good" : "bad";
  const Icon = c.abs > 0 ? IconArrowUp : IconArrowDown;
  const word = c.abs === 0 ? t.same : c.abs > 0 ? t.up : t.down;
  return (
    <span className={`delta ${tone}`}>
      {c.abs !== 0 && <Icon aria-hidden="true" />}
      <span className="sr-only">{word} </span>
      {c.pct !== null ? percent(c.pct, true) : money(c.abs, true)}
      {suffix && <span className="delta-suffix"> {suffix}</span>}
    </span>
  );
}

export function KpiCards({ m, c }: { m: Metrics; c: Comparison | null; lang?: Lang }) {
  const t = REPORT_T.en;
  const vs = c ? `${t.vsShort} ${c.previousPeriod.slice(0, 3)}` : undefined;
  return (
    <div className="kpi-row">
      <div className="kpi-card"><span className="kpi-label">{t.revenue}</span><span className="kpi-value num">{money(m.revenue)}</span><Delta c={c?.revenue} suffix={vs} /></div>
      <div className="kpi-card"><span className="kpi-label">{t.expenses}</span><span className="kpi-value num">{money(m.expenses)}</span><Delta c={c?.expenses} invert suffix={vs} /></div>
      <div className="kpi-card"><span className="kpi-label">{t.profit}</span><span className={`kpi-value num ${m.netProfit < 0 ? "neg" : ""}`}>{money(m.netProfit)}</span><Delta c={c?.netProfit} suffix={vs} /></div>
      <div className="kpi-card">
        <span className="kpi-label">{t.margin}</span><span className="kpi-value num">{percent(m.marginPct)}</span>
        {c && c.marginPts !== null && (
          <span className={`delta ${c.marginPts > 0 ? "good" : c.marginPts < 0 ? "bad" : "flat"}`}>
            {c.marginPts !== 0 && (c.marginPts > 0 ? <IconArrowUp aria-hidden="true" /> : <IconArrowDown aria-hidden="true" />)}
            <span className="sr-only">{c.marginPts > 0 ? t.up : c.marginPts < 0 ? t.down : t.same} </span>
            {points(c.marginPts)}<span className="delta-suffix"> {vs}</span>
          </span>
        )}
      </div>
    </div>
  );
}

export function TipsGrid({ tips, lang }: { tips: AiReport["tips_report"]; lang: Lang }) {
  const t = REPORT_T.en;
  const groups = [
    ["profit", t.profitA, "green"],
    ["cash_flow", t.cash, "blue"],
    ["costs", t.costs, "rose"],
    ["growth", t.growth, "amber"],
  ] as const;
  return (
    <div className="tips-grid">
      {groups.map(([key, label, tone]) => (
        <section className={`tip-group ${tone}`} key={key} aria-label={label}>
          <h3><span className="dot" aria-hidden="true" />{label}</h3>
          <ul lang={lang}>
            {tips[key].map((tip, i) => (
              <li key={i}><strong>{tip.title}</strong><span>{tip.detail}</span></li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

type Props = {
  lang: Lang;
  metrics: Metrics;
  comparison: Comparison | null;
  content: AiReport;
  showTips?: boolean;
};

export default function ReportView({ lang, metrics: m, comparison: c, content, showTips = false }: Props) {
  const t = REPORT_T.en;
  const mr = content.monthly_report;
  const maxExp = Math.max(...m.topExpenses.map((e) => e.amount), 1);
  const barColors = ["#397FA3", "#5E97B6", "#7C6BB4", "#C98A2B", "#B4505F"];

  return (
    <div className="report-view">
      <KpiCards m={m} c={c} lang={lang} />
      {!c && <p className="hint">{t.noPrev}</p>}

      <section className="card summary-card" aria-labelledby="sum-h">
        <p className="label-green" id="sum-h">{t.summary}</p>
        <p className="summary-text" lang={lang}>{mr.headline}</p>
      </section>

      <div className="three-col">
        <section className="card col-card" aria-labelledby="wc-h">
          <h2 id="wc-h"><span className="ic-tile sm"><IconTrendUp /></span>{t.changed}</h2>
          <ul lang={lang}>{mr.what_changed.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </section>
        <section className="card col-card" aria-labelledby="wm-h">
          <h2 id="wm-h"><span className="ic-tile sm rose"><IconAlert /></span>{t.matters}</h2>
          <ul lang={lang}>{mr.why_it_matters.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </section>
        <section className="card col-card" aria-labelledby="wn-h">
          <h2 id="wn-h"><span className="ic-tile sm blue"><IconTodo /></span>{t.next}</h2>
          <ol lang={lang}>{mr.what_to_do_next.map((s, i) => <li key={i}>{s}</li>)}</ol>
        </section>
      </div>

      <div className="two-col">
        <section className="card" aria-labelledby="ex-h">
          <h2 id="ex-h" className="card-title">{t.topExp}</h2>
          <ul className="money-bars">
            {m.topExpenses.map((e, i) => (
              <li key={e.category}>
                <span>{e.category}</span>
                <span className="mb-track" aria-hidden="true"><i style={{ width: `${(e.amount / maxExp) * 100}%`, background: barColors[i % barColors.length] }} /></span>
                <span className="num">{money(e.amount)}</span>
              </li>
            ))}
          </ul>
          <p className="fine-print">{m.topExpenses.map((e) => `${e.category} ${percent(e.sharePct)}`).join(" · ")} {t.ofExp}</p>
        </section>
        {c && c.categoryChanges.length > 0 && (
          <section className="card" aria-labelledby="mv-h">
            <h2 id="mv-h" className="card-title">{t.movers}</h2>
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th scope="col">{t.category}</th><th scope="col" className="r">{t.before}</th><th scope="col" className="r">{t.after}</th><th scope="col" className="r">{t.change}</th></tr></thead>
                <tbody>
                  {c.categoryChanges.map((x) => (
                    <tr key={x.category}>
                      <td>{x.category}</td>
                      <td className="r num">{money(x.previous)}</td>
                      <td className="r num">{money(x.current)}</td>
                      <td className="r"><Delta c={{ abs: x.abs, pct: null }} invert lang={lang} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {showTips && (
        <section className="card" aria-labelledby="tips-h">
          <h2 id="tips-h" className="card-title with-icon"><span className="ic-tile sm amber"><IconBulb /></span>{t.tips}</h2>
          <TipsGrid tips={content.tips_report} lang={lang} />
        </section>
      )}

      <p className="note"><IconReport aria-hidden="true" />{t.numbersNote}</p>
      <p className="disclaimer">{t.disclaimer}</p>
    </div>
  );
}
