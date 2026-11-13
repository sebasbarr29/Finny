import "server-only";
import { xlsxToCsv } from "./excel";
import { CsvError, MAX_FILE_BYTES, parseStatement, type Metrics } from "./finance";
import { MONTH_NAMES } from "./i18n";

export type UploadedFile = { name: string; text: string };

/** Accepts .csv/.txt as text and .xlsx as Excel. Returns null when no file was chosen. */
export async function readUpload(value: FormDataEntryValue | null, label: string): Promise<UploadedFile | null> {
  if (!value || typeof value === "string" || value.size === 0) return null;
  const name = value.name || `${label}.csv`;
  if (value.size > MAX_FILE_BYTES) throw new CsvError(`"${name}" is larger than 2 MB. Upload one month at a time.`);
  if (/\.xls$/i.test(name)) throw new CsvError(`"${name}" is an old Excel format (.xls). Open it in Excel and save it as .xlsx or CSV.`);
  if (/\.xlsx$/i.test(name) || /spreadsheetml/.test(value.type)) {
    return { name, text: await xlsxToCsv(Buffer.from(await value.arrayBuffer()), name) };
  }
  if (!/\.(csv|txt)$/i.test(name) && !/csv|text\/plain/.test(value.type)) {
    throw new CsvError(`"${name}" isn't a CSV or Excel file. In your spreadsheet app, use File → Download/Save as → CSV or .xlsx.`);
  }
  return { name, text: await value.text() };
}

/** "2026-10" -> "October 2026"; anything else -> null (keep the detected month). */
export function periodFromInput(v: FormDataEntryValue | null): string | null {
  if (typeof v !== "string") return null;
  const m = v.match(/^(20\d{2})-(0[1-9]|1[0-2])$/);
  return m ? `${MONTH_NAMES[Number(m[2]) - 1]} ${m[1]}` : null;
}

/** Parses a file and applies the month the user picked, if any. */
export function parseWithPeriod(file: UploadedFile, fallback: string, override: string | null): Metrics {
  const metrics = parseStatement(file.text, file.name, fallback);
  return override ? { ...metrics, period: override } : metrics;
}
