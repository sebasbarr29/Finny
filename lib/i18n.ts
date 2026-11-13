export type Lang = "en" | "es";

export const REPORT_T = {
  en: {
    monthly: "Monthly Report", tips: "Business Tips", plan: "Action Plan",
    revenue: "Revenue", expenses: "Expenses", profit: "Net profit", margin: "Profit margin",
    vs: "vs.", vsShort: "vs", changed: "What changed", matters: "Why it matters", next: "What to do next",
    summary: "Summary", topExp: "Where the money went", ofExp: "of expenses", movers: "Biggest cost changes",
    category: "Category", before: "Before", after: "Now", change: "Change",
    profitA: "Profit", cash: "Cash flow", costs: "Costs", growth: "Growth",
    from: "From", sample: "Sample report", noPrev: "Single month — upload the previous month to see changes.",
    numbersNote: "Every number was calculated by Finny directly from the uploaded file. The AI wrote the explanations using only those numbers.",
    disclaimer: "Finny gives general business guidance, not tax, legal, or investment advice. For those, talk to a qualified professional.",
    up: "up", down: "down", same: "no change",
  },
  es: {
    monthly: "Reporte mensual", tips: "Consejos para tu negocio", plan: "Plan de acción",
    revenue: "Ingresos", expenses: "Gastos", profit: "Utilidad neta", margin: "Margen de utilidad",
    vs: "vs.", vsShort: "vs", changed: "Qué cambió", matters: "Por qué importa", next: "Qué hacer ahora",
    summary: "Resumen", topExp: "En qué se fue el dinero", ofExp: "de los gastos", movers: "Mayores cambios en costos",
    category: "Categoría", before: "Antes", after: "Ahora", change: "Cambio",
    profitA: "Utilidad", cash: "Flujo de caja", costs: "Costos", growth: "Crecimiento",
    from: "Archivos", sample: "Reporte de muestra", noPrev: "Un solo mes — sube el mes anterior para ver los cambios.",
    numbersNote: "Finny calculó cada número directamente del archivo. La IA escribió las explicaciones usando solo esos números.",
    disclaimer: "Finny ofrece orientación general para negocios, no asesoría fiscal, legal ni de inversiones. Para eso, consulta a un profesional calificado.",
    up: "subió", down: "bajó", same: "sin cambio",
  },
} as const;

const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

/** "October 2026" -> "Octubre 2026" for Spanish; other labels pass through. */
export function localPeriod(label: string, lang: Lang): string {
  if (lang !== "es") return label;
  if (label === "This month") return "Este mes";
  if (label === "Previous month") return "Mes anterior";
  const i = MONTHS_EN.findIndex((m) => label.startsWith(m));
  return i === -1 ? label : MONTHS_ES[i] + label.slice(MONTHS_EN[i].length);
}

/** Short month for charts: "October 2026" -> "OCT". */
export function shortMonth(label: string): string {
  const i = MONTHS_EN.findIndex((m) => label.startsWith(m));
  return i === -1 ? label.slice(0, 3).toUpperCase() : MONTHS_EN[i].slice(0, 3).toUpperCase();
}

/** Sort key for "October 2026" style labels (unknown labels sort last). */
export function periodKey(label: string): number {
  const i = MONTHS_EN.findIndex((m) => label.startsWith(m));
  const y = Number(label.match(/(20\d{2})/)?.[1] ?? 0);
  return i === -1 || !y ? Number.MAX_SAFE_INTEGER : y * 12 + i;
}

export const MONTH_NAMES = MONTHS_EN;
