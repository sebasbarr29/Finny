import "server-only";
import Papa from "papaparse";
import { readSheet } from "read-excel-file/node";
import { CsvError } from "./finance";

/** Reads the first sheet of an .xlsx file and returns it as CSV text for the normal parser. */
export async function xlsxToCsv(buffer: Buffer, fileName: string): Promise<string> {
  let rows: unknown[][];
  try {
    rows = (await readSheet(buffer)) as unknown[][];
  } catch {
    throw new CsvError(`Couldn't open "${fileName}" as an Excel file. Save it as .xlsx or CSV and try again.`);
  }
  const cells = rows.map((r) =>
    r.map((v) => {
      if (v === null || v === undefined) return "";
      if (v instanceof Date) return v.toISOString().slice(0, 10);
      return String(v);
    }),
  );
  return Papa.unparse(cells);
}
