// Readers for JSON from a host or registry API: a field of the wrong type
// reads as missing instead of reaching the DB or a page.

export type Json = Record<string, unknown>;

export function obj(v: unknown): Json {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Json) : {};
}

export function str(v: unknown): string | undefined {
  return typeof v === "string" ? v : undefined;
}

export function num(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}
