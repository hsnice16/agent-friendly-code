import { HOST_LABELS } from "@/lib/constants/hosts";
import type { SignalResult } from "@/lib/scoring/signals";
import { MODELS } from "@/lib/scoring/weights";
import { hasAgentFile } from "@/lib/utils/agent-instructions";
import { fitSentences, MAX_DESCRIPTION_LENGTH, MAX_TITLE_LENGTH } from "@/lib/utils/page-title";
import { readers } from "@/lib/utils/readers";
import type { RepoSummary } from "@/lib/utils/repo-summary";

// Missing checks more than one agent reads, the most widely read first.
// Single-agent files (.aider.conf.yml, GEMINI.md, …) are missing almost
// everywhere, and listing them made half the descriptions end the same way.
function sharedMissing(signals: SignalResult[]): string[] {
  return signals
    .filter((s) => s.pass === 0 && readers(s.id) > 1)
    .sort((a, b) => readers(b.id) - readers(a.id) || a.label.localeCompare(b.label))
    .map((s) => s.label);
}

// Check labels ("Linter / formatter config") read as a table, not a sentence.
// Ordered by what an agent leans on first; `size` is left out, since "has a
// manageable size" says nothing.
const HAS_WORDS: [string, string][] = [
  ["tests", "tests"],
  ["ci", "CI"],
  ["linter", "a linter config"],
  ["type_config", "type checking"],
  ["pre_commit", "pre-commit hooks"],
  ["dev_env", "a dev environment"],
  ["contributing", "a CONTRIBUTING guide"],
  ["deps_manifest", "a dependency manifest"],
  ["readme", "a README"],
  ["license", "a license"],
];

/** The agent instructions file found at the root, null when there is none, undefined when unknown. */
function agentsFile(signals: SignalResult[]): string | null | undefined {
  const s = signals.find((x) => x.id === "agents_md");
  if (!s) return undefined;
  return hasAgentFile(s) ? (s.matchedPath ?? null) : null;
}

function hasList(signals: SignalResult[]): string[] {
  const has = (id: string) => (signals.find((s) => s.id === id)?.pass ?? 0) > 0;
  const file = agentsFile(signals);
  return [...(file ? [file] : []), ...HAS_WORDS.filter(([id]) => has(id)).map(([, w]) => w)];
}

function joinAnd(items: string[]): string {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function listThatFits(items: string[], room: number, render: (items: string[]) => string): string | null {
  let best: string | null = null;
  for (let n = 1; n <= items.length; n++) {
    const s = render(items.slice(0, n));
    if (s.length > room) break;
    best = s;
  }
  return best;
}

/**
 * Says what the number measures: a bare "83.8 / 100" earned impressions for
 * score-string and "<repo> github" searches, and no clicks from either. Most
 * searches that reach these pages are "<repo> github" or "<repo> repo", so the
 * slug leads and "GitHub repo" follows it; the AGENTS.md state comes next when
 * it fits, for "<repo> AGENTS.md" searches. The slug is in every form, which
 * keeps titles unique.
 */
export function repoTitle(slug: string, overall: number | null, signals: SignalResult[] = [], host?: string): string {
  const label = host ? HOST_LABELS[host] : undefined;
  const repo = label ? `${label} repo` : "repo";
  if (overall == null) return `${slug} ${repo}: AI agent readiness`;

  const score = `${overall.toFixed(1)}/100`;
  const file = agentsFile(signals);
  const forms = [
    ...(file ? [`${slug} ${repo}: ${file}, agent score ${score}`] : []),
    ...(file === null ? [`${slug} ${repo}: no AGENTS.md, agent score ${score}`] : []),
    `${slug} ${repo}: agent readiness ${score}`,
    `${slug} ${repo}, agent score ${score}`,
    ...(label ? [`${slug} on ${label}: agent score ${score}`] : []),
    `${slug} repo: agent readiness ${score}`,
    `${slug} repo · agent score ${score}`,
    `${slug} agent readiness ${score}`,
    `${slug} ${score}`,
  ];
  const fits = forms.find((f) => f.length <= MAX_TITLE_LENGTH);
  if (fits) return fits;
  // Only a slug past ~50 characters gets here; the score must not be the part cut.
  return `${slug.slice(0, MAX_TITLE_LENGTH - score.length - 2)}… ${score}`;
}

/** The repo's own description as a sentence, or null when it would not fit whole beside `lead`. */
function aboutSentence(about: string | null | undefined, lead: string): string | null {
  if (!about) return null;
  const s = /[.!?…]$/.test(about) ? about : `${about}.`;
  return lead.length + 1 + s.length <= MAX_DESCRIPTION_LENGTH ? s : null;
}

// The repo's own words lead when they fit beside the score: searchers looking
// for the repo recognise its description before our numbers, and it is the only
// text here not derived from scores, so it tells repos with the same gaps
// apart. Never cut, since a truncated sentence reads as a bug.
export function repoDescription(
  slug: string,
  summary: RepoSummary | null,
  overall: number | null,
  signals: SignalResult[],
  about?: string | null,
): string {
  if (!summary || overall == null) {
    const lead = `How ready ${slug} is for ${MODELS.length} AI coding agents, and what would help most.`;
    const own = aboutSentence(about, lead);
    return own ? `${lead} ${own}` : lead;
  }

  const lr = summary.languageRank;
  const inLanguage = lr ? `, #${lr.rank} of ${lr.total} in ${lr.language}` : "";
  const ranks = `${overall.toFixed(1)}/100 for AI agent readiness: #${summary.rank} of ${summary.total}${inLanguage}.`;
  const missing = sharedMissing(signals);

  const own = aboutSentence(about, `${slug}: Scores ${ranks}`);
  const parts = own ? [`${slug}: ${own}`, `Scores ${ranks}`] : [`${slug} scores ${ranks}`];
  const room = MAX_DESCRIPTION_LENGTH - parts.join(" ").length - 1;
  const list =
    missing.length === 0
      ? listThatFits(hasList(signals), room, (items) => `Has ${joinAnd(items)}.`)
      : listThatFits(missing, room, (items) => `Missing: ${items.join(", ")}.`);
  if (list) parts.push(list);
  if (summary.best && summary.best.tiedWith === 0) {
    parts.push(`Best set up for ${summary.best.model.label}.`);
  }
  parts.push(`Passes ${summary.passing} of ${summary.signalCount} checks.`);

  // The first part carries the slug, which keeps every description unique.
  return fitSentences(parts, { skip: true });
}
