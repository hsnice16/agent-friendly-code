import raw from "@/data/ai-policy.json";

import { AUTHOR_JSON_LD } from "./author";
import { AI_POLICY_REPORT_PATH } from "./utils/report-path";
import { APP_NAME, APP_URL } from "./version";

// Strictest first: the page lists stances in this order and a policy that fits two takes the stricter.
export const STANCES = ["bans", "restricts", "disclose", "allows", "welcomes"] as const;
export type Stance = (typeof STANCES)[number];

export const STANCE_LABEL: Record<Stance, string> = {
  bans: "Bans",
  restricts: "Restricts",
  disclose: "Disclose",
  allows: "Allows",
  welcomes: "Welcomes",
};

export const STANCE_MEANING: Record<Stance, string> = {
  bans: "AI-generated code or pull requests are not accepted.",
  restricts:
    "AI code is accepted only in narrow ways: with prior approval, for some kinds of change, or with human-written PR text and replies.",
  disclose: "AI-assisted work is accepted if disclosed, and you stay responsible for it.",
  allows: "AI-assisted work is accepted under the usual quality and responsibility rules, with no disclosure asked.",
  welcomes: "The project actively invites contributions made with AI or coding agents.",
};

export type AiPolicy = {
  host: string;
  owner: string;
  name: string;
  stance: Stance;
  summary: string;
  url: string;
  path: string;
  /** Contributors must say they used AI (in the PR, a commit trailer or a label). */
  disclosure: boolean;
  /** PR descriptions, issues or replies to maintainers must be the contributor's own words. */
  noAiText: boolean;
  /** Agents acting without a human approving each step are explicitly not accepted. */
  noAutonomousAgents: boolean;
};

export type AiPolicyData = { checked: string; source: string; scanned: number; policies: AiPolicy[] };

export const MAX_SUMMARY_WORDS = 18;

const isStance = (v: unknown): v is Stance => typeof v === "string" && (STANCES as readonly string[]).includes(v);

/** Throws on a malformed row so a bad hand edit fails the build, not a page render. */
export function parseAiPolicy(input: unknown): AiPolicyData {
  const d = input as Partial<AiPolicyData>;
  if (typeof d.checked !== "string" || typeof d.scanned !== "number" || !Array.isArray(d.policies)) {
    throw new Error("ai-policy.json: missing checked, scanned or policies");
  }
  for (const p of d.policies) {
    if (!isStance(p.stance)) throw new Error(`ai-policy.json: bad stance for ${p.owner}/${p.name}`);
    // Rendered as an href: a `javascript:` URL would run on click.
    if (typeof p.url !== "string" || !p.url.startsWith("https://")) {
      throw new Error(`ai-policy.json: url must be https for ${p.owner}/${p.name}`);
    }
    for (const k of ["disclosure", "noAiText", "noAutonomousAgents"] as const) {
      if (typeof p[k] !== "boolean") throw new Error(`ai-policy.json: ${k} missing for ${p.owner}/${p.name}`);
    }
  }
  return d as AiPolicyData;
}

export const AI_POLICY = parseAiPolicy(raw);

export const repoKey = (r: { host: string; owner: string; name: string }) =>
  `${r.host}/${r.owner}/${r.name}`.toLowerCase();

export function aiPolicyByRepo(data: AiPolicyData = AI_POLICY): Map<string, { stance: Stance; url: string }> {
  return new Map(data.policies.map((p) => [repoKey(p), { stance: p.stance, url: p.url }]));
}

export function stanceCounts(policies: AiPolicy[]): Record<Stance, number> {
  const counts = Object.fromEntries(STANCES.map((s) => [s, 0])) as Record<Stance, number>;
  for (const p of policies) counts[p.stance]++;
  return counts;
}

export function groupByStance(policies: AiPolicy[]): { stance: Stance; policies: AiPolicy[] }[] {
  return STANCES.map((stance) => ({ stance, policies: policies.filter((p) => p.stance === stance) })).filter(
    (g) => g.policies.length > 0,
  );
}

export type PolicyAsks = { total: number; disclosure: number; noAiText: number; noAutonomousAgents: number };

export function policyAsks(policies: AiPolicy[]): PolicyAsks {
  return {
    total: policies.length,
    disclosure: policies.filter((p) => p.disclosure).length,
    noAiText: policies.filter((p) => p.noAiText).length,
    noAutonomousAgents: policies.filter((p) => p.noAutonomousAgents).length,
  };
}

export const stanceAnchor = (s: Stance) => `stance-${s}`;

// Projects people search for by name ("rust ai contribution policy"). Only repos in the census:
// the Linux kernel and Fedora aren't on the board, so nothing here may speak for them.
const NAMED_PROJECTS = [
  { label: "Rust", host: "github", owner: "rust-lang", name: "rust" },
  { label: "Kubernetes", host: "github", owner: "kubernetes", name: "kubernetes" },
  { label: "Node.js", host: "github", owner: "nodejs", name: "node" },
  { label: "LLVM", host: "github", owner: "llvm", name: "llvm-project" },
  { label: "TypeScript", host: "github", owner: "microsoft", name: "TypeScript" },
] as const;

export type NamedProject = (typeof NAMED_PROJECTS)[number] & { policy: AiPolicy | null };

export function namedProjects(data: AiPolicyData = AI_POLICY): NamedProject[] {
  const byKey = new Map(data.policies.map((p) => [repoKey(p), p]));
  return NAMED_PROJECTS.map((n) => ({ ...n, policy: byKey.get(repoKey(n)) ?? null }));
}

export function aiPolicyTitle(data: AiPolicyData = AI_POLICY): string {
  return `AI contribution policies in ${data.policies.length} popular open source repos`;
}

export function aiPolicyDescription(data: AiPolicyData = AI_POLICY): string {
  const c = stanceCounts(data.policies);
  return `We read the AI policies of ${data.policies.length} of ${data.scanned} popular GitHub repos: ${c.bans} ban AI code, ${c.restricts} restrict it, ${c.disclose} require disclosure, ${c.allows + c.welcomes} allow it.`;
}

export function aiPolicyJsonLd(data: AiPolicyData = AI_POLICY): Record<string, unknown>[] {
  const url = `${APP_URL}${AI_POLICY_REPORT_PATH}`;
  return [
    {
      "@type": "TechArticle",
      headline: aiPolicyTitle(data),
      description: aiPolicyDescription(data),
      url,
      dateModified: data.checked,
      author: AUTHOR_JSON_LD,
      publisher: { "@type": "Organization", name: APP_NAME, url: APP_URL },
      about: [{ "@type": "Thing", name: "AI-assisted contributions to open source" }],
    },
    {
      "@type": "Dataset",
      "@id": `${url}#dataset`,
      name: `${aiPolicyTitle(data)}, by stance`,
      description: `Each written AI contribution policy we found in ${data.scanned} GitHub repos on the ${APP_NAME} leaderboard, classified by hand as bans, restricts, disclose, allows or welcomes.`,
      url,
      keywords: ["AI contribution policy", "AI-generated code", "open source", "CONTRIBUTING.md", "AI_POLICY.md"],
      isAccessibleForFree: true,
      dateModified: data.checked,
      creator: { "@type": "Organization", name: APP_NAME, url: APP_URL },
      license: "https://opensource.org/licenses/MIT",
      isPartOf: { "@id": `${APP_URL}/#dataset` },
      variableMeasured: ["Stance on AI-assisted contributions", "Disclosure required", "Human-written PR text"],
    },
  ];
}
