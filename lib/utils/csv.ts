/**
 * One CSV cell. A leading `=`, `+`, `-`, `@`, tab or CR gets a `'` so a
 * spreadsheet opening the download treats the cell as text, not a formula.
 */
export function csvField(v: string | number | null | undefined): string {
  if (typeof v === "number") return String(v);
  const raw = v ?? "";
  const s = /^[=+\-@\t\r]/.test(raw) ? `'${raw}` : raw;
  return /[",\n\r]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}
