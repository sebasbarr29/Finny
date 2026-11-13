import Papa from "papaparse";

/**
 * Reads a P&L or bank-export CSV and calculates the key numbers in code.
 * All money math happens here, in integer cents. The AI never calculates.
 */

export class CsvError extends Error {}

type Kind = "revenue" | "expense";
type Line = { category: string; kind: Kind; cents: number };

export type CategoryAmount = { category: string; amount: number; sharePct: number };

export type Metrics = {
  period: string;
  format: "pnl" | "bank";
  revenue: number;
  expenses: number;
  netProfit: number;
  marginPct: number | null;
  topExpenses: CategoryAmount[];
  revenueSources: CategoryAmount[];
  expenseCategories: Record<string, number>;
  rowsUsed: number;
  rowsSkipped: number;
};

export type Change = { abs: number; pct: number | null };

export type Comparison = {
  previousPeriod: string;
  previous: Pick<Metrics, "revenue" | "expenses" | "netProfit" | "marginPct">;
  revenue: Change;
  expenses: Change;
  netProfit: Change;
  marginPts: number | null;
  categoryChanges: { category: string; previous: number; current: number; abs: number; pct: number | null }[];
};

export const MAX_FILE_BYTES = 2 * 1024 * 1024;
const MAX_ROWS = 50_000;

const norm = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function findCol(headers: string[], candidates: RegExp[]): number {
  for (const re of candidates) {
    const i = headers.findIndex((h) => re.test(h));
    if (i !== -1) return i;
  }
  return -1;
}

const COLS = {
  type: [/^(type|kind|tipo|section|class|classification)$/, /\b(type|tipo)\b/],
  amount: [/^(amount|total|value|monto|importe|valor|sum)$/, /\bamount\b/, /\b(monto|importe)\b/],
  debit: [/^(debit|debits|withdrawal|withdrawals|money out|cargo|cargos|retiro|retiros)$/, /\b(debit|withdrawal|money out)\b/],
  credit: [/^(credit|credits|deposit|deposits|money in|abono|abonos|deposito|depositos)$/, /\b(credit|deposit|money in)\b/],
  category: [/^(category|categoria|account|cuenta|line item|item|concepto|rubro)$/, /\b(category|categoria|account)\b/],
  description: [/^(description|descripcion|memo|details|detalle|payee|name|merchant|narrative)$/, /\b(description|memo|payee)\b/],
  date: [/^(date|fecha|posted date|transaction date|posting date|fecha operacion)$/, /\b(date|fecha)\b/, /^(month|mes|period|periodo)$/],
};

/** "$1,234.50", "(450)", "-12", "1 200" -> cents. Returns null if not a number. */
export function parseAmount(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  let s = String(raw).trim();
  if (!s) return null;
  let negative = false;
  if (/^\(.*\)$/.test(s)) { negative = true; s = s.slice(1, -1); }
  if (s.endsWith("-")) { negative = true; s = s.slice(0, -1); }
  s = s.replace(/[$€£¢\s]|USD|MXN|CRC|EUR/gi, "").replace(/,/g, "");
  if (s.startsWith("-")) { negative = !negative; s = s.slice(1); }
  if (s.startsWith("+")) s = s.slice(1);
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const cents = Math.round(parseFloat(s) * 100);
  return negative ? -cents : cents;
}

function kindFromType(v: string): Kind | null {
  const t = norm(v);
  if (/\b(revenue|income|sales|sale|ingreso|ingresos|venta|ventas|inflow)\b/.test(t)) return "revenue";
  if (/\b(expense|expenses|cost|costs|cogs|gasto|gastos|costo|costos|outflow)\b/.test(t)) return "expense";
  return null;
}

const TOTAL_ROW = /^(total|subtotal|net|gross profit|net income|net profit|net loss|utilidad|total ingresos|total gastos)\b/;

function cleanCategory(s: string): string {
  const cleaned = s
    .replace(/\s+/g, " ")
    .split(" ")
    .filter((w) => !/\d{3,}/.test(w) && !/^#\S*$/.test(w))
    .join(" ")
    .trim()
    .slice(0, 60);
  return cleaned || "Other";
}

const MONTHS_EN = ["january","february","march","april","may","june","july","august","september","october","november","december"];
const MONTHS_ES = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
const MONTHS_SHORT = MONTHS_EN.map((m) => m.slice(0, 3));

function monthLabel(year: number, month0: number): string {
  return `${MONTHS_EN[month0][0].toUpperCase()}${MONTHS_EN[month0].slice(1)} ${year}`;
}

function parseDateYm(raw: string): string | null {
  const s = raw.trim();
  let m = s.match(/^(\d{4})[-/.](\d{1,2})(?:[-/.](\d{1,2}))?$|^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m && m[1]) return `${m[1]}-${m[2].padStart(2, "0")}`;
  if (m && m[4]) return `${m[4]}-${m[5].padStart(2, "0")}`;
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (m) {
    const year = m[3].length === 2 ? `20${m[3]}` : m[3];
    // US style M/D/Y unless the first part can't be a month.
    const month = Number(m[1]) > 12 ? m[2] : m[1];
    return `${year}-${month.padStart(2, "0")}`;
  }
  return null;
}

function periodFromFileName(name: string): string | null {
  const n = norm(name.replace(/\.[^.]+$/, ""));
  const ym = n.match(/\b(20\d{2})\s(\d{1,2})\b/);
  if (ym && Number(ym[2]) >= 1 && Number(ym[2]) <= 12) return monthLabel(Number(ym[1]), Number(ym[2]) - 1);
  const year = n.match(/\b(20\d{2})\b/)?.[1];
  for (let i = 0; i < 12; i++) {
    const re = new RegExp(`\\b(${MONTHS_EN[i]}|${MONTHS_ES[i]}|${MONTHS_SHORT[i]})\\b`);
    if (re.test(n)) return year ? monthLabel(Number(year), i) : MONTHS_EN[i][0].toUpperCase() + MONTHS_EN[i].slice(1);
  }
  return null;
}

export function parseStatement(text: string, fileName: string, fallbackPeriod: string): Metrics {
  const cleanText = text.replace(/^﻿/, "");
  if (!cleanText.trim()) throw new CsvError(`"${fileName}" is empty.`);
  if (/\u0000/.test(cleanText.slice(0, 2000))) throw new CsvError(`"${fileName}" doesn't look like a CSV file. Export your report as CSV and try again.`);

  const parsed = Papa.parse<string[]>(cleanText, { skipEmptyLines: "greedy" });
  const rows = parsed.data.filter((r) => Array.isArray(r) && r.some((c) => String(c).trim() !== ""));
  if (rows.length < 2) throw new CsvError(`"${fileName}" needs a header row and at least one row of numbers.`);
  if (rows.length > MAX_ROWS) throw new CsvError(`"${fileName}" has more than ${MAX_ROWS.toLocaleString()} rows. Upload one month at a time.`);

  // Some exports put a title above the header. Use the first row that has an amount-like column.
  let headerIdx = 0;
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const h = rows[i].map((c) => norm(String(c)));
    if (findCol(h, COLS.amount) !== -1 || (findCol(h, COLS.debit) !== -1 && findCol(h, COLS.credit) !== -1)) { headerIdx = i; break; }
  }
  const headers = rows[headerIdx].map((c) => norm(String(c)));
  const body = rows.slice(headerIdx + 1);

  const iType = findCol(headers, COLS.type);
  const iAmount = findCol(headers, COLS.amount);
  const iDebit = findCol(headers, COLS.debit);
  const iCredit = findCol(headers, COLS.credit);
  const iCat = findCol(headers, COLS.category);
  const iDesc = findCol(headers, COLS.description);
  const iDate = findCol(headers, COLS.date);

  const hasDebitCredit = iDebit !== -1 && iCredit !== -1;
  if (iAmount === -1 && !hasDebitCredit) {
    const found = rows[headerIdx].map((c) => String(c).trim()).filter(Boolean).slice(0, 8).join(", ");
    throw new CsvError(
      `Couldn't find an amount column in "${fileName}". Found: ${found || "no column names"}. ` +
        `Use a column named "Amount" (or "Debit" and "Credit" for bank exports).`,
    );
  }

  const lines: Line[] = [];
  const monthCounts = new Map<string, number>();
  let skipped = 0;
  let sawNegative = false;

  for (const r of body) {
    const cell = (i: number) => (i >= 0 && i < r.length ? String(r[i] ?? "").trim() : "");
    const label = cell(iCat) || cell(iDesc);
    if (TOTAL_ROW.test(norm(label))) { skipped++; continue; }
    const category = cleanCategory(label || "Uncategorized");

    if (iDate !== -1) {
      const ym = parseDateYm(cell(iDate));
      if (ym) monthCounts.set(ym, (monthCounts.get(ym) ?? 0) + 1);
    }

    if (iType !== -1 && iAmount !== -1) {
      const kind = kindFromType(cell(iType));
      const cents = parseAmount(cell(iAmount));
      if (!kind || cents === null || cents === 0) { skipped++; continue; }
      lines.push({ category, kind, cents: Math.abs(cents) });
    } else if (hasDebitCredit && (iAmount === -1 || (cell(iDebit) || cell(iCredit)))) {
      const out = parseAmount(cell(iDebit));
      const inn = parseAmount(cell(iCredit));
      if ((!out || out === 0) && (!inn || inn === 0)) { skipped++; continue; }
      if (inn) lines.push({ category, kind: "revenue", cents: Math.abs(inn) });
      if (out) lines.push({ category, kind: "expense", cents: Math.abs(out) });
    } else {
      const cents = parseAmount(cell(iAmount));
      if (cents === null || cents === 0) { skipped++; continue; }
      if (cents < 0) sawNegative = true;
      lines.push({ category, kind: cents > 0 ? "revenue" : "expense", cents: Math.abs(cents) });
    }
  }

  if (iType === -1 && !hasDebitCredit && !sawNegative && lines.length > 0) {
    throw new CsvError(
      `Every amount in "${fileName}" is positive, so Finny can't tell income from expenses. ` +
        `Add a "Type" column with "Revenue" or "Expense", or use negative numbers for money going out.`,
    );
  }
  if (lines.length === 0) {
    throw new CsvError(`Couldn't read any amounts in "${fileName}". Check that the amount column has numbers like 1250.00 or $1,250.`);
  }

  let period = fallbackPeriod;
  if (monthCounts.size) {
    const [ym] = [...monthCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    const [y, m] = ym.split("-").map(Number);
    if (m >= 1 && m <= 12) period = monthLabel(y, m - 1);
  } else {
    period = periodFromFileName(fileName) ?? fallbackPeriod;
  }

  return summarize(lines, period, iType !== -1 ? "pnl" : "bank", skipped);
}

const dollars = (cents: number) => Math.round(cents) / 100;
const pct = (part: number, whole: number) => (whole === 0 ? null : Math.round((part / whole) * 1000) / 10);

function summarize(lines: Line[], period: string, format: "pnl" | "bank", skipped: number): Metrics {
  const rev = new Map<string, number>();
  const exp = new Map<string, number>();
  for (const l of lines) {
    const map = l.kind === "revenue" ? rev : exp;
    map.set(l.category, (map.get(l.category) ?? 0) + l.cents);
  }
  const revenue = [...rev.values()].reduce((a, b) => a + b, 0);
  const expenses = [...exp.values()].reduce((a, b) => a + b, 0);
  const net = revenue - expenses;
  const top = (m: Map<string, number>, total: number) =>
    [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, c]) => ({ category, amount: dollars(c), sharePct: pct(c, total) ?? 0 }));

  return {
    period,
    format,
    revenue: dollars(revenue),
    expenses: dollars(expenses),
    netProfit: dollars(net),
    marginPct: pct(net, revenue),
    topExpenses: top(exp, expenses),
    revenueSources: top(rev, revenue),
    expenseCategories: Object.fromEntries([...exp.entries()].map(([k, v]) => [k, dollars(v)])),
    rowsUsed: lines.length,
    rowsSkipped: skipped,
  };
}

const change = (cur: number, prev: number): Change => ({
  abs: Math.round((cur - prev) * 100) / 100,
  pct: prev === 0 ? null : Math.round(((cur - prev) / Math.abs(prev)) * 1000) / 10,
});

export function compare(current: Metrics, previous: Metrics): Comparison {
  const cats = new Set([...Object.keys(current.expenseCategories), ...Object.keys(previous.expenseCategories)]);
  const categoryChanges = [...cats]
    .map((category) => {
      const cur = current.expenseCategories[category] ?? 0;
      const prev = previous.expenseCategories[category] ?? 0;
      const c = change(cur, prev);
      return { category, previous: prev, current: cur, abs: c.abs, pct: c.pct };
    })
    .filter((c) => c.abs !== 0)
    .sort((a, b) => Math.abs(b.abs) - Math.abs(a.abs))
    .slice(0, 5);

  return {
    previousPeriod: previous.period,
    previous: { revenue: previous.revenue, expenses: previous.expenses, netProfit: previous.netProfit, marginPct: previous.marginPct },
    revenue: change(current.revenue, previous.revenue),
    expenses: change(current.expenses, previous.expenses),
    netProfit: change(current.netProfit, previous.netProfit),
    marginPts:
      current.marginPct === null || previous.marginPct === null
        ? null
        : Math.round((current.marginPct - previous.marginPct) * 10) / 10,
    categoryChanges,
  };
}

/* ---------- Formatting shared by the AI prompt and the UI ---------- */

export function money(n: number, signed = false): string {
  const abs = Math.abs(n);
  const body = abs.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(abs) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  const sign = n < 0 ? "-" : signed && n > 0 ? "+" : "";
  return `${sign}$${body}`;
}

export function percent(n: number | null, signed = false): string {
  if (n === null) return "n/a";
  const sign = n < 0 ? "-" : signed && n > 0 ? "+" : "";
  return `${sign}${Math.abs(n).toFixed(1)}%`;
}

export function points(n: number | null): string {
  if (n === null) return "n/a";
  const sign = n < 0 ? "-" : n > 0 ? "+" : "";
  return `${sign}${Math.abs(n).toFixed(1)} pts`;
}
