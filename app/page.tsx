import Link from "next/link";
import LineChart from "./components/LineChart";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import {
  IconArrow, IconBriefcase, IconBulb, IconChats, IconCheck, IconCoffee, IconFileUp, IconGlobe, IconGrid,
  IconListChecks, IconReport, IconScissors, IconShield, IconSparkle, IconStethoscope, IconStore, IconTable,
  IconTrend, IconWrench, LogoMark,
} from "./components/icons";

// Example data: September and October match the sample clinic CSVs exactly;
// May–August are illustrative so the trend line has shape. Everything is labeled as an example.
const MONTHS = ["MAY", "JUN", "JUL", "AUG", "SEP", "OCT"];
const REVENUE = [36400, 37600, 37100, 38600, 39700, 42180];
const EXPENSES = [30200, 30900, 31400, 31600, 32300, 35940];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow-line"><span aria-hidden="true" />{children}</p>;
}

function Kpi({ label, value, delta, tone }: { label: string; value: string; delta: string; tone: "up" | "down" }) {
  return (
    <div className="mk-kpi">
      <span className="mk-kpi-label">{label}</span>
      <span className="mk-kpi-value num">{value}</span>
      <span className={`mk-kpi-delta ${tone}`}>{delta}</span>
    </div>
  );
}

function HeroPreview() {
  const nav = [
    { icon: IconGrid, label: "Dashboard", on: true },
    { icon: IconReport, label: "Reports" },
    { icon: IconBulb, label: "Business tips" },
    { icon: IconChats, label: "Ask Finny" },
    { icon: IconListChecks, label: "Action plan" },
  ];
  return (
    <figure className="preview-frame" aria-label="Example of the Finny dashboard with sample clinic data">
      <div className="preview-window">
        <div className="preview-chrome">
          <span className="dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="preview-title">Finny · Dashboard</span>
          <span aria-hidden="true" />
        </div>
        <div className="preview-app">
          <aside className="preview-side" aria-hidden="true">
            <span className="logo"><LogoMark /><span>Finny</span></span>
            <ul>
              {nav.map(({ icon: Icon, label, on }) => (
                <li key={label} className={on ? "on" : undefined}><Icon />{label}</li>
              ))}
            </ul>
            <div className="preview-plan"><strong>Pro plan</strong><span>Unlimited monthly reports</span></div>
          </aside>
          <div className="preview-main">
            <div className="preview-head">
              <div className="preview-head-l"><strong>October 2026</strong><span className="tag-pill">MONTHLY</span></div>
              <div className="preview-head-r"><span className="tag-pill plain">Export PDF</span><span className="avatar-sm">SB</span></div>
            </div>
            <div className="preview-body">
              <div className="mk-kpis four">
                <Kpi label="Revenue" value="$42,180" delta="+6.2% vs Sep" tone="up" />
                <Kpi label="Expenses" value="$35,940" delta="+11.3% vs Sep" tone="down" />
                <Kpi label="Net profit" value="$6,240" delta="−15.7% vs Sep" tone="down" />
                <Kpi label="Margin" value="14.8%" delta="−3.8 pts vs Sep" tone="down" />
              </div>
              <div className="preview-grid">
                <div className="mk-card chart-card">
                  <div className="chart-head">
                    <strong>Revenue vs expenses</strong>
                    <span className="legend">
                      <span><i className="sw solid" />Revenue</span>
                      <span><i className="sw dashed" />Expenses</span>
                    </span>
                  </div>
                  <LineChart
                    labels={MONTHS}
                    ariaLabel="Example revenue and expenses from May to October 2026. Revenue rises to $42,180 in October; expenses rise to $35,940."
                    series={[
                      { label: "Revenue", values: REVENUE, color: "var(--brand)", area: true },
                      { label: "Expenses", values: EXPENSES, color: "var(--sky)", dashed: true },
                    ]}
                  />
                </div>
                <div className="insight-card">
                  <p className="insight-label">What changed</p>
                  <p className="insight-text">Revenue grew <strong>$2,480</strong>, but medical supplies rose <strong>$2,900</strong> — that gap is why profit fell this month.</p>
                  <hr />
                  <p className="insight-next">Next: get quotes from two supply vendors before your next order.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="preview-caption">Illustrative example · October 2026, sample clinic</figcaption>
    </figure>
  );
}

function ReportPreview() {
  const rows = [
    { label: "Revenue", value: 42180, color: "var(--brand)" },
    { label: "Payroll", value: 19100, color: "#397FA3" },
    { label: "Medical supplies", value: 7000, color: "#5E97B6" },
    { label: "Rent", value: 4200, color: "#8DB4C9" },
    { label: "Equipment lease", value: 1400, color: "#B8CFDC" },
  ];
  return (
    <div className="mk-frame">
      <div className="mk-panel">
        <div className="mk-panel-head">
          <span className="live-dot" aria-hidden="true" />
          <strong>October 2026 · Monthly report</strong>
          <span className="tag-pill">EXAMPLE DATA</span>
        </div>
        <div className="mk-panel-body">
          <div className="mk-kpis three">
            <Kpi label="Revenue" value="$42,180" delta="+6.2% vs Sep" tone="up" />
            <Kpi label="Expenses" value="$35,940" delta="+11.3% vs Sep" tone="down" />
            <Kpi label="Net profit" value="$6,240" delta="−15.7% vs Sep" tone="down" />
          </div>
          <p className="mk-sub">Where the money went</p>
          <ul className="money-bars">
            {rows.map((r) => (
              <li key={r.label}>
                <span>{r.label}</span>
                <span className="mb-track"><i style={{ width: `${(r.value / 42180) * 100}%`, background: r.color }} /></span>
                <span className="num">${r.value.toLocaleString("en-US")}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="mk-panel-foot">
          <p className="mk-sub green">What changed</p>
          <p>Revenue grew $2,480, but medical supplies rose $2,900. That extra spend is what pulled profit down $1,160 this month.</p>
        </div>
      </div>
    </div>
  );
}

function AskPreview() {
  return (
    <div className="mk-frame">
      <div className="mk-panel">
        <div className="mk-panel-head">
          <span className="ic-tile sm"><IconSparkle /></span>
          <strong>Ask Finny</strong>
          <span className="tag-pill plain">Your data only</span>
        </div>
        <div className="chat-demo">
          <p className="bubble-user">Why did profit drop this month if sales went up?</p>
          <div className="bubble-row">
            <span className="avatar-sm f">F</span>
            <p className="bubble-ai">
              Revenue rose <strong>$2,480</strong>, but expenses rose <strong>$3,640</strong> — mostly medical supplies (<strong>+$2,900</strong>) and payroll (<strong>+$600</strong>). That&apos;s why profit landed <strong>$1,160</strong> lower than September.
            </p>
          </div>
          <p className="bubble-user">Which cost should I look at first?</p>
          <div className="bubble-row">
            <span className="avatar-sm f">F</span>
            <p className="bubble-ai">Medical supplies. They went from <strong>$4,100</strong> to <strong>$7,000</strong>, the biggest change of any expense this month.</p>
          </div>
          <div className="chat-input-demo" aria-hidden="true"><span>Ask about your numbers…</span><span className="send">Ask</span></div>
        </div>
      </div>
    </div>
  );
}

function PlanPreview() {
  const items = [
    { t: "Compare quotes from two medical supply vendors", cat: "Costs", pri: "High", done: true },
    { t: "Follow up on unpaid insurance claims", cat: "Cash flow", pri: "High", done: false },
    { t: "Check if the extra marketing spend brought new patients", cat: "Growth", pri: "Medium", done: false },
    { t: "Match staff schedules to your busiest hours", cat: "Profit", pri: "Low", done: false },
  ];
  return (
    <div className="mk-frame">
      <div className="mk-panel">
        <div className="mk-panel-head">
          <span className="ic-tile sm"><IconListChecks /></span>
          <strong>Action plan · October 2026</strong>
          <span className="tag-pill">1 OF 4 DONE</span>
        </div>
        <div className="mk-panel-body">
          <div className="pbar" aria-hidden="true"><i style={{ width: "25%" }} /></div>
          <ul className="plan-demo">
            {items.map((i) => (
              <li key={i.t} className={i.done ? "done" : undefined}>
                <span className="cb" aria-hidden="true">{i.done && <IconCheck />}</span>
                <span className="pd-text">{i.t}</span>
                <span className={`prio ${i.pri.toLowerCase()}`}>{i.pri}</span>
                <span className="cat">{i.cat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

const FAQ = [
  {
    q: "What files can I upload?",
    a: "A monthly P&L or a bank export as a CSV or Excel (.xlsx) file. Finny looks for an amount column plus a category or description, and either a Type column (Revenue or Expense) or negative numbers for money going out. Separate Debit and Credit columns work too.",
  },
  {
    q: "What does a report include?",
    a: "Total revenue, expenses, net profit, profit margin and your biggest costs, plus month-over-month changes when you upload two months. Then a plain-language summary of what changed, why it matters and what to do next, a Business Tips Report, and an action plan checklist.",
  },
  {
    q: "Is my financial data private?",
    a: "Your reports are tied to your account and only you can see them. Finny stores the numbers it calculates and the reports it writes, not your raw file. To write the explanations, Finny sends the calculated numbers to Anthropic's Claude API.",
  },
  {
    q: "Which languages are supported?",
    a: "English and Spanish. Pick the language when you create a report, and switch any saved report between English and Español later.",
  },
  {
    q: "What's included in the free plan?",
    a: "One full report (Monthly Report, Business Tips and action plan) and five Ask Finny questions. No card needed. Pro is $29/month for unlimited reports and questions, and you can cancel anytime.",
  },
  {
    q: "Does Finny replace my accountant?",
    a: "No. Finny gives general business guidance to help you understand your numbers. It doesn't give tax, legal, or investment advice — for those, talk to a qualified professional.",
  },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        {/* Hero */}
        <section className="mk-hero">
          <div className="wrap hero-inner">
            <p className="hero-badge"><span className="live-dot" aria-hidden="true" />Ask Finny now answers questions about your own numbers</p>
            <h1 className="hero-title">
              The monthly financial report <span>your accountant never sends.</span>
            </h1>
            <p className="hero-sub">
              Upload your P&amp;L or bank export. Finny tells you what changed, why it matters, and exactly what to do next —
              in plain English or Spanish, in about two minutes. Built for owners of clinics, shops, and small teams.
            </p>
            <div className="hero-ctas">
              <Link className="btn btn-primary btn-lg" href="/signup">Start free — no card <IconArrow /></Link>
              <Link className="btn btn-secondary btn-lg" href="/sample">See a sample report</Link>
            </div>
            <ul className="hero-checks">
              <li><IconCheck />No card required</li>
              <li><IconCheck />One free report</li>
              <li><IconCheck />English &amp; Spanish</li>
            </ul>
            <p className="hero-built">Built by <strong>Sebastián Barrantes</strong></p>
          </div>
          <div className="wrap"><HeroPreview /></div>
        </section>

        {/* Audience */}
        <section className="built-for" aria-labelledby="built-for-h">
          <div className="wrap built-for-inner">
            <h2 id="built-for-h" className="label-caps">Built for</h2>
            <ul>
              <li><IconStethoscope />Clinics &amp; practices</li>
              <li><IconStore />Independent shops</li>
              <li><IconWrench />Trades &amp; contractors</li>
              <li><IconScissors />Salons &amp; studios</li>
              <li><IconCoffee />Cafés &amp; restaurants</li>
              <li><IconBriefcase />Consultants &amp; freelancers</li>
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section className="mk-section" id="how" aria-labelledby="how-h">
          <div className="wrap">
            <div className="section-head">
              <Eyebrow>How it works</Eyebrow>
              <h2 id="how-h">From spreadsheet to next move in three steps</h2>
              <p>No setup, no integrations, no finance background required. If you can export a file, you can use Finny.</p>
            </div>
            <ol className="steps3">
              <li className="step-card">
                <div className="step-top"><span className="ic-tile"><IconFileUp /></span><span className="step-no">Step 1</span></div>
                <h3>Upload your month</h3>
                <p>Drop in a CSV or Excel P&amp;L, or a bank export. Pick the month and Finny reads revenue and expenses for you.</p>
                <span className="step-foot">About 2 minutes</span>
              </li>
              <li className="step-card">
                <div className="step-top"><span className="ic-tile"><IconSparkle /></span><span className="step-no">Step 2</span></div>
                <h3>Read the report</h3>
                <p>A short report on what moved, why it matters for profit and cash, and the next steps — written for an owner, not an accountant.</p>
                <span className="step-foot">English or Español</span>
              </li>
              <li className="step-card">
                <div className="step-top"><span className="ic-tile"><IconListChecks /></span><span className="step-no">Step 3</span></div>
                <h3>Work the plan</h3>
                <p>Your next steps become a monthly checklist with categories and priorities. Tick them off as you go — progress saves automatically.</p>
                <span className="step-foot">Checked off as you go</span>
              </li>
            </ol>
          </div>
        </section>

        {/* Feature deep-dives */}
        <section className="mk-section tight" id="features" aria-label="Features">
          <div className="wrap">
            <div className="split">
              <div className="split-text">
                <Eyebrow>Monthly report</Eyebrow>
                <h2>Your month, explained in a two-minute read</h2>
                <p>Finny reads your export, calculates the numbers itself, then writes the story behind them. Every figure in the report traces back to a line in your file.</p>
                <ul className="check-list">
                  <li><IconCheck />What changed, with the real amounts and percentages</li>
                  <li><IconCheck />Why it matters for profit and cash, in plain words</li>
                  <li><IconCheck />What to do next, specific to your business</li>
                </ul>
                <Link className="text-link" href="/signup">Start free to try it <IconArrow /></Link>
              </div>
              <ReportPreview />
            </div>

            <div className="split reverse">
              <div className="split-text">
                <Eyebrow>Ask Finny</Eyebrow>
                <h2>Ask a question, get an answer from your own numbers</h2>
                <p>Wondering why profit dropped, or whether you can afford another hire? Ask in your own words. Finny answers from the months you&apos;ve uploaded — and tells you when the data isn&apos;t there instead of guessing.</p>
                <ul className="check-list">
                  <li><IconCheck />Answers only from your saved reports</li>
                  <li><IconCheck />Ask in English or Spanish</li>
                  <li><IconCheck />Suggested questions to get you started</li>
                </ul>
              </div>
              <AskPreview />
            </div>

            <div className="split">
              <div className="split-text">
                <Eyebrow>Action plan</Eyebrow>
                <h2>Recommendations that turn into a checklist</h2>
                <p>Every report ends with concrete next steps. Finny groups them by category and priority so you know what to do first, and saves your progress as you tick them off.</p>
                <ul className="check-list">
                  <li><IconCheck />Grouped by profit, cash flow, costs and growth</li>
                  <li><IconCheck />High, medium and low priority</li>
                  <li><IconCheck />One plan per month, saved to your account</li>
                </ul>
              </div>
              <PlanPreview />
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section className="mk-section tight" aria-labelledby="grid-h">
          <div className="wrap">
            <div className="section-head">
              <Eyebrow>Why owners use Finny</Eyebrow>
              <h2 id="grid-h">Clear answers, without a finance degree</h2>
            </div>
            <div className="feature-grid">
              <div className="f-card"><span className="ic-tile"><IconReport /></span><h3>Plain-English insights</h3><p>Short sentences about your business, not accounting jargon.</p></div>
              <div className="f-card"><span className="ic-tile blue"><IconTrend /></span><h3>Monthly trends</h3><p>See revenue, expenses and profit move from month to month.</p></div>
              <div className="f-card"><span className="ic-tile amber"><IconGlobe /></span><h3>English &amp; Spanish</h3><p>Every report in English or Español, for you, a partner or your team.</p></div>
              <div className="f-card"><span className="ic-tile violet"><IconTable /></span><h3>Works with your spreadsheets</h3><p>CSV and Excel P&amp;Ls and bank exports — no integrations to set up.</p></div>
              <div className="f-card"><span className="ic-tile"><IconListChecks /></span><h3>Actionable recommendations</h3><p>Next steps you can actually do this month, ranked by priority.</p></div>
              <div className="f-card"><span className="ic-tile rose"><IconShield /></span><h3>Never invents numbers</h3><p>Finny calculates every figure from your file. If something is missing, it says so instead of guessing.</p></div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="mk-section" id="pricing" aria-labelledby="pricing-h">
          <div className="wrap">
            <div className="section-head center">
              <Eyebrow>Pricing</Eyebrow>
              <h2 id="pricing-h">Start free. Upgrade when it&apos;s worth it.</h2>
              <p>Try a full report on us. Pro is one simple plan for your monthly reports.</p>
            </div>
            <div className="pricing-cards">
              <div className="plan">
                <h3>Free</h3>
                <p className="plan-price"><span className="num">$0</span></p>
                <p className="plan-desc">See what Finny finds in your numbers.</p>
                <ul className="check-list">
                  <li><IconCheck />1 full monthly report</li>
                  <li><IconCheck />Business Tips and action plan</li>
                  <li><IconCheck />5 Ask Finny questions</li>
                  <li><IconCheck />English or Spanish</li>
                </ul>
                <Link className="btn btn-secondary btn-block" href="/signup">Start free — no card</Link>
              </div>
              <div className="plan pro">
                <div className="plan-top"><h3>Pro</h3><span className="tag-pill">MOST COMPLETE</span></div>
                <p className="plan-price"><span className="num">$29</span><span>/ month</span></p>
                <p className="plan-desc">Your monthly report, every month.</p>
                <ul className="check-list">
                  <li><IconCheck />Unlimited monthly reports</li>
                  <li><IconCheck />Unlimited Ask Finny questions</li>
                  <li><IconCheck />Trends across all your months</li>
                  <li><IconCheck />Every month saved, with trends and action plans</li>
                  <li><IconCheck />Cancel anytime</li>
                </ul>
                <Link className="btn btn-primary btn-block" href="/signup?plan=pro">Get Pro</Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mk-section tight" id="faq" aria-labelledby="faq-h">
          <div className="wrap faq-wrap">
            <div className="section-head">
              <Eyebrow>FAQ</Eyebrow>
              <h2 id="faq-h">Questions owners ask</h2>
            </div>
            <div className="faq">
              {FAQ.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}<span className="faq-icon" aria-hidden="true" /></summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mk-section tight">
          <div className="wrap">
            <div className="final-cta">
              <h2>Know your numbers. Know your next move.</h2>
              <p>Upload last month&apos;s P&amp;L or bank export and get your first report free.</p>
              <div className="hero-ctas">
                <Link className="btn btn-primary btn-lg" href="/signup">Start free — no card <IconArrow /></Link>
                <Link className="btn btn-secondary btn-lg" href="/sample">See a sample report</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
