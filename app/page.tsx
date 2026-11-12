import Link from "next/link";
import SampleReport from "./components/SampleReport";
import {
  IconArrow, IconBriefcase, IconBulb, IconCalc, IconChart, IconChat, IconCheck, IconClinic,
  IconGlobe, IconHistory, IconReport, IconShield, IconShop, IconTodo, IconUpload, LogoMark,
} from "./components/icons";

export default function Home() {
  return (
    <>
      <header className="nav">
        <div className="wrap">
          <Link className="logo" href="/"><LogoMark />Finny</Link>
          <nav className="nav-links" aria-label="Main">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className="nav-right">
            <Link className="btn btn-ghost" href="/login">Log in</Link>
            <Link className="btn btn-primary" href="/signup">Sign up</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="wrap">
            <div className="hero-top">
              <div className="hero-copy">
                <span className="badge" style={{ alignSelf: "flex-start" }}>
                  <b>EN · ES</b><span>Reports in English or Spanish</span>
                </span>
                <h1>Your AI <span className="grad">finance buddy</span> for small businesses.</h1>
              </div>
              <div className="hero-side">
                <p className="lede">
                  Upload your monthly P&amp;L or bank CSV. Finny calculates your key numbers and writes a
                  plain-language report on <strong>what changed, why it matters, and what to do next</strong>,
                  plus practical tips to improve profit, cash flow, costs, and growth.
                </p>
                <div className="ctas">
                  <Link className="btn btn-primary" href="/signup">Sign up free <IconArrow /></Link>
                  <Link className="btn btn-secondary" href="/login">Log in</Link>
                </div>
                <p className="cta-note">Your first report is free. Then $29/month.</p>
                <div className="creator">
                  <span className="avatar" aria-hidden="true">SB</span>
                  <span>Built by <strong>Sebastián Barrantes</strong></span>
                </div>
              </div>
            </div>
            <div className="window-wrap">
              <SampleReport />
            </div>
          </div>
        </section>

        <section className="audience" aria-label="Who Finny is for">
          <div className="wrap">
            <span className="lbl">Made for</span>
            <span className="who"><IconClinic />Small clinics</span>
            <span className="who"><IconShop />Independent shops</span>
            <span className="who"><IconBriefcase />Small business owners</span>
          </div>
        </section>

        <section className="section" id="how">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">How it works</span>
              <h2>From a spreadsheet to clear next steps.</h2>
              <p>No accounting background needed. Use the files you already have from your bookkeeping or your bank.</p>
            </div>
            <ol className="steps">
              <li className="step">
                <div className="step-n"><span>Step 1</span><IconUpload /></div>
                <h3>Upload your CSV</h3>
                <p>Add a monthly P&amp;L or a bank export. Upload two months to compare them.</p>
              </li>
              <li className="step">
                <div className="step-n"><span>Step 2</span><IconCalc /></div>
                <h3>Finny does the math</h3>
                <p>Revenue, expenses, net profit, profit margin, and your biggest costs, calculated exactly from your file.</p>
              </li>
              <li className="step">
                <div className="step-n"><span>Step 3</span><IconReport /></div>
                <h3>Read your two reports</h3>
                <p>A Monthly Report and a Business Tips Report, written in plain English or Spanish.</p>
              </li>
              <li className="step">
                <div className="step-n"><span>Step 4</span><IconHistory /></div>
                <h3>Come back every month</h3>
                <p>Every report is saved to your account, so you can look back and see how you&apos;re doing.</p>
              </li>
            </ol>
          </div>
        </section>

        <section className="section tight" id="features">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">Features</span>
              <h2>Two reports that tell you where you stand and what to do.</h2>
              <p>Built for owners, not accountants. Every number comes straight from your file.</p>
            </div>

            <div className="core">
              <article className="card">
                <span className="ic g"><IconReport /></span>
                <h3>Monthly Financial Report</h3>
                <p>Your month in plain language, with the key numbers up front.</p>
                <ul className="ticks">
                  <li><IconCheck />Total revenue, expenses, net profit, and profit margin</li>
                  <li><IconCheck />Your biggest expense categories</li>
                  <li><IconCheck />Month-over-month changes when you upload two months</li>
                  <li><IconCheck />What changed, why it matters, and what to do next</li>
                </ul>
                <div className="vis" aria-hidden="true">
                  <div className="report-mini">
                    <div className="row"><span>Revenue</span><span className="num">$42,180 <span className="chip up">+6.2%</span></span></div>
                    <div className="row"><span>Expenses</span><span className="num">$35,940 <span className="chip down">+11.3%</span></span></div>
                    <div className="note">&ldquo;Profit dropped because supplies cost more this month.&rdquo;</div>
                  </div>
                </div>
              </article>

              <article className="card">
                <span className="ic a"><IconBulb /></span>
                <h3>Business Tips Report</h3>
                <p>Practical recommendations based on your own numbers, in four areas.</p>
                <div className="vis tips-grid" aria-hidden="true">
                  <div className="tip"><span className="t"><i style={{ background: "var(--brand)" }} />Profit</span><p>Where your margin is going and how to protect it.</p></div>
                  <div className="tip"><span className="t"><i style={{ background: "var(--sky)" }} />Cash flow</span><p>How to keep enough cash on hand month to month.</p></div>
                  <div className="tip"><span className="t"><i style={{ background: "var(--rose)" }} />Costs</span><p>Which expenses to review first.</p></div>
                  <div className="tip"><span className="t"><i style={{ background: "var(--amber)" }} />Growth</span><p>Realistic ideas to grow revenue.</p></div>
                </div>
              </article>
            </div>

            <div className="later" aria-label="Features coming soon">
              <div className="later-item">
                <div className="top"><span className="ic b"><IconChat /></span><span className="soon">Coming soon</span></div>
                <h3>Ask Finny</h3>
                <p>Ask follow-up questions about your report.</p>
              </div>
              <div className="later-item">
                <div className="top"><span className="ic g"><IconChart /></span><span className="soon">Coming soon</span></div>
                <h3>Financial dashboard</h3>
                <p>Track your key numbers over time.</p>
              </div>
              <div className="later-item">
                <div className="top"><span className="ic r"><IconTodo /></span><span className="soon">Coming soon</span></div>
                <h3>Action plan</h3>
                <p>Turn your report into a monthly to-do list.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section tight" aria-labelledby="value-h">
          <div className="wrap">
            <div className="sec-head">
              <span className="eyebrow">Why Finny</span>
              <h2 id="value-h">What you get for $29 a month.</h2>
              <p>Understanding your numbers shouldn&apos;t take a finance degree or a long meeting with your accountant.</p>
            </div>
            <div className="value">
              <div className="value-item"><span className="ic g"><IconReport /></span><h3>A clear report every month</h3><p>Both reports for every month you upload, written for business owners.</p></div>
              <div className="value-item"><span className="ic b"><IconShield /></span><h3>Numbers you can trust</h3><p>Finny calculates every figure from your file. The AI explains the numbers and never makes them up.</p></div>
              <div className="value-item"><span className="ic a"><IconGlobe /></span><h3>English or Spanish</h3><p>Pick the language for each report, for you, a partner, or your team.</p></div>
              <div className="value-item"><span className="ic r"><IconHistory /></span><h3>Your history in one place</h3><p>Past reports stay in your account so you can compare months.</p></div>
            </div>
          </div>
        </section>

        <section className="section" id="pricing">
          <div className="wrap pricing-grid">
            <div className="sec-head">
              <span className="eyebrow">Pricing</span>
              <h2>One simple plan.</h2>
              <p>Try Finny with one free report. If it helps, subscribe for $29/month and cancel anytime.</p>
            </div>
            <div className="price-card">
              <div className="pc-top"><h3>Finny</h3><span className="free-tag">First report free</span></div>
              <div className="amount"><b>$29</b><span>/ month</span></div>
              <p className="pc-sub">For clinics, shops, and small business owners.</p>
              <ul className="checks">
                <li><IconCheck />Monthly Financial Reports in English or Spanish</li>
                <li><IconCheck />Business Tips Report with every upload</li>
                <li><IconCheck />Month-over-month comparisons</li>
                <li><IconCheck />All your past reports saved</li>
              </ul>
              <Link className="btn btn-primary btn-block" href="/signup">Sign up</Link>
              <p className="fine">Already have an account? <Link href="/login">Log in</Link></p>
            </div>
          </div>
        </section>

        <section className="cta">
          <div className="wrap">
            <div className="cta-card">
              <div>
                <h2>Know your numbers. Know your next move.</h2>
                <p>Upload last month&apos;s P&amp;L or bank CSV and get your first report free.</p>
              </div>
              <div className="cta-side">
                <Link className="btn btn-primary" href="/signup">Sign up free <IconArrow /></Link>
                <Link className="btn btn-secondary" href="/login">Log in</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <div className="foot-l">
            <Link className="logo" href="/"><LogoMark />Finny</Link>
            <p>Your AI finance buddy for small businesses.</p>
          </div>
          <div className="built"><span className="avatar" aria-hidden="true">SB</span><span>Built by <strong>Sebastián Barrantes</strong></span></div>
          <div className="foot-b">
            <span>Finny gives general business guidance, not tax, legal, or investment advice.</span>
            <span className="foot-links"><Link href="/login">Log in</Link><Link href="/signup">Sign up</Link><span>© 2026 Sebastián Barrantes</span></span>
          </div>
        </div>
      </footer>
    </>
  );
}
