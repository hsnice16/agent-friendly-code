// Scans raw bytes, not rows: freed pages keep deleted rows until a VACUUM, and
// a committed DB publishes them. Plain substrings with no word boundary, since
// the byte before a value is a record header that is often a letter.
const PATTERNS: { label: string; re: RegExp }[] = [
  { label: "local path", re: /\/Users\/|\/home\/|\/var\/folders\/|\/private\/var\/|[A-Za-z]:[\\/]Users[\\/]/g },
  { label: "GitHub token", re: /gh[pousr]_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{22,}/g },
  { label: "GitLab token", re: /glpat-[A-Za-z0-9_-]{20}/g },
  { label: "AWS key", re: /AKIA[0-9A-Z]{16}/g },
  // A bare `sk-` prefix would match slugs like `task-…`.
  { label: "API key", re: /sk-(?:ant|proj)-[A-Za-z0-9_-]{20,}/g },
  { label: "Slack token", re: /xox[abprs]-[A-Za-z0-9-]{10,}/g },
  { label: "private key", re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g },
];

const printable = (s: string) => s.replace(/[^\x20-\x7e]/g, "?");

export type Leak = { label: string; match: string; offset: number };

export function findLeaks(bytes: Uint8Array): Leak[] {
  const text = Buffer.from(bytes).toString("latin1");
  const leaks: Leak[] = [];

  for (const { label, re } of PATTERNS) {
    for (const m of text.matchAll(re)) {
      // CI logs are public, so a token is reported by its prefix only.
      const match = label === "local path" ? printable(text.slice(m.index, m.index + 80)) : `${m[0].slice(0, 8)}…`;
      leaks.push({ label, match, offset: m.index });
    }
  }

  return leaks;
}
