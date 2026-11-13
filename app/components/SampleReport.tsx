"use client";

import { useState } from "react";
import { IconAlert, IconBulb, IconReport, IconTodo, IconTrendUp, IconUpload, IconCard, LogoMark } from "./icons";

type Lang = "en" | "es";

const t = {
  en: {
    title: "October report",
    sub: "Compared with September · sample data",
    revenue: "Revenue",
    expenses: "Expenses",
    profit: "Net profit",
    margin: "Profit margin",
    chart: "Revenue vs. expenses",
    summary: "Monthly report",
    changedH: "What changed",
    changed: "Sales grew 6%, but expenses grew faster.",
    mattersH: "Why it matters",
    matters: "Supplies rose $2,900, which cut profit by 16%.",
    nextH: "What to do next",
    next: "Get quotes from two suppliers and set a supplies budget.",
    note: "Sample report for an example clinic. Numbers are made up.",
    nav: ["Reports", "Business tips", "Upload CSV", "Plan & billing"],
  },
  es: {
    title: "Reporte de octubre",
    sub: "Comparado con septiembre · datos de muestra",
    revenue: "Ingresos",
    expenses: "Gastos",
    profit: "Utilidad neta",
    margin: "Margen",
    chart: "Ingresos vs. gastos",
    summary: "Reporte mensual",
    changedH: "Qué cambió",
    changed: "Las ventas crecieron 6%, pero los gastos crecieron más.",
    mattersH: "Por qué importa",
    matters: "Los insumos subieron $2,900 y la utilidad bajó 16%.",
    nextH: "Qué hacer ahora",
    next: "Pide cotizaciones a dos proveedores y define un presupuesto de insumos.",
    note: "Reporte de muestra de una clínica de ejemplo. Los números son inventados.",
    nav: ["Reportes", "Consejos", "Subir CSV", "Plan y pago"],
  },
} as const;

// Example data on a $20k–$45k scale: y = 170 - (value - 20) / 25 * 150
const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
const xs = [0, 104, 208, 312, 416, 520];
const rev = [74, 59, 50, 66.8, 51.8, 36.9];
const exp = [110, 104, 95, 99.2, 96.2, 74.4];
const pts = (ys: number[]) => ys.map((y, i) => `${xs[i]},${y}`).join(" ");

export default function SampleReport() {
  const [lang, setLang] = useState<Lang>("en");
  const s = t[lang];
  const navIcons = [IconReport, IconBulb, IconUpload, IconCard];

  return (
    <figure className="window" aria-label="Sample Finny report with example data">
      <div className="chrome">
        <div className="dots" aria-hidden="true"><i /><i /><i /></div>
        <div className="url">finny / reports / october</div>
        <span className="chrome-tag">Sample report</span>
      </div>
      <div className="app">
        <aside className="side" aria-hidden="true">
          <span className="logo"><LogoMark />Finny</span>
          {s.nav.map((label, i) => {
            const Icon = navIcons[i];
            return (
              <span key={label} className={`side-item${i === 0 ? " on" : ""}`}>
                <Icon />{label}
              </span>
            );
          })}
          <div className="biz"><b>Example Clinic</b>clinic_october.csv</div>
        </aside>

        <div className="main">
          <div className="main-head">
            <div>
              <h3>{s.title}</h3>
              <p>{s.sub}</p>
            </div>
            <div className="seg" role="group" aria-label="Report language">
              <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>English</button>
              <button type="button" aria-pressed={lang === "es"} onClick={() => setLang("es")}>Español</button>
            </div>
          </div>

          <div className="kpis">
            <div className="kpi"><span className="k">{s.revenue}</span><span className="v num">$42,180</span><span className="chip up">+6.2%</span></div>
            <div className="kpi"><span className="k">{s.expenses}</span><span className="v num">$35,940</span><span className="chip down">+11.3%</span></div>
            <div className="kpi"><span className="k">{s.profit}</span><span className="v num">$6,240</span><span className="chip down">−15.7%</span></div>
            <div className="kpi"><span className="k">{s.margin}</span><span className="v num">14.8%</span><span className="chip flat">−3.8 pts</span></div>
          </div>

          <div className="panels">
            <div className="panel">
              <div className="panel-h">
                <span>{s.chart}</span>
                <div className="legend">
                  <span><i style={{ background: "var(--brand)" }} />{s.revenue}</span>
                  <span><i style={{ background: "var(--sky)" }} />{s.expenses}</span>
                </div>
              </div>
              <svg className="chart" viewBox="-38 0 576 196" role="img" aria-label="Example revenue and expenses, May to October">
                <defs>
                  <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="var(--brand)" stopOpacity=".25" />
                    <stop offset="1" stopColor="var(--brand)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <g stroke="var(--line)" strokeWidth="1">
                  {[20, 50, 80, 110, 140, 170].map((y) => <line key={y} x1="0" x2="520" y1={y} y2={y} />)}
                </g>
                <g textAnchor="end">
                  {["$45k", "$40k", "$35k", "$30k", "$25k", "$20k"].map((l, i) => <text key={l} x="-8" y={23 + i * 30}>{l}</text>)}
                </g>
                <g textAnchor="middle">
                  {months.map((m, i) => <text key={m} x={xs[i]} y="190">{m}</text>)}
                </g>
                <path d={`M${pts(rev).replace(/ /g, " L")} L520,170 L0,170 Z`} fill="url(#rev-fill)" />
                <polyline points={pts(rev)} fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                <polyline points={pts(exp)} fill="none" stroke="var(--sky)" strokeWidth="2.5" strokeDasharray="7 6" strokeLinejoin="round" strokeLinecap="round" />
                <circle cx="520" cy="36.9" r="4.5" fill="var(--surface)" stroke="var(--brand)" strokeWidth="2.5" />
                <circle cx="520" cy="74.4" r="4.5" fill="var(--surface)" stroke="var(--sky)" strokeWidth="2.5" />
              </svg>
            </div>

            <div className="panel">
              <div className="panel-h"><span>{s.summary}</span></div>
              <div className="insight">
                <div className="insight-item"><span className="ic g"><IconTrendUp /></span><div><b>{s.changedH}</b>{s.changed}</div></div>
                <div className="insight-item"><span className="ic r"><IconAlert /></span><div><b>{s.mattersH}</b>{s.matters}</div></div>
                <div className="insight-item"><span className="ic b"><IconTodo /></span><div><b>{s.nextH}</b>{s.next}</div></div>
              </div>
            </div>
          </div>
          <p className="example">{s.note}</p>
        </div>
      </div>
    </figure>
  );
}
