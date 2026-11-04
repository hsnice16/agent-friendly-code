import Link from "next/link";

import { VS_AGENTS_MD } from "@/lib/check-content/vs-agents-md";
import { SIGNALS } from "@/lib/scoring/signals";
import { MODELS } from "@/lib/scoring/weights";
import { TOPICS_PATH, topicPath } from "@/lib/topics";
import { checkPath, checkSubPath, frameworkExamplesPath } from "@/lib/utils/check-path";
import { hubPath } from "@/lib/utils/language";
import { modelPath } from "@/lib/utils/leaderboard-href";
import { REPORT_PATH, REPORT_TITLE } from "@/lib/utils/report-path";

type Item = { label: string; href: string };

type Props = {
  hubs: { slug: string; label: string }[];
  topics: { slug: string; label: string }[];
  frameworks: { slug: string; label: string }[];
};

// Full lists, not previews: a link from every page is what gets these pages
// crawled. Under the home board the same lists read as clutter.
export function FooterDirectory({ hubs, topics, frameworks }: Props) {
  const rows: { label: string; items: Item[]; all?: Item }[] = [
    {
      label: "Agents",
      items: MODELS.map((m) => ({ label: m.label, href: modelPath(m.id) })),
      all: { label: "Files each reads →", href: "/agents" },
    },
    {
      label: "Languages",
      items: hubs.map((g) => ({ label: g.label, href: hubPath(g.slug) })),
      all: { label: "All languages →", href: "/language" },
    },
    {
      label: "Checks",
      items: SIGNALS.map((s) => ({ label: s.label, href: checkPath(s.id) })),
      all: { label: "Agent-ready checklist →", href: "/check" },
    },
    {
      label: "Guides",
      items: [
        { label: "AGENTS.md vs CLAUDE.md", href: checkSubPath("agents_md", "vs-claude-md") },
        ...Object.entries(VS_AGENTS_MD).map(([id, c]) => ({
          label: `${c.name} vs AGENTS.md`,
          href: checkSubPath(id, "vs-agents-md"),
        })),
        ...frameworks.map((f) => ({ label: `AGENTS.md for ${f.label}`, href: frameworkExamplesPath(f.slug) })),
        { label: REPORT_TITLE, href: REPORT_PATH },
      ],
      all: { label: "Make your repo agent-ready →", href: "/guide" },
    },
    {
      label: "Topics",
      items: topics.map((t) => ({ label: t.label, href: topicPath(t.slug) })),
      all: { label: "All topics →", href: TOPICS_PATH },
    },
  ];

  return (
    <nav
      aria-label="Directory"
      className="mb-8 flex flex-col gap-4 border-b border-line pb-8 [&_a]:hover:text-ink-soft"
    >
      {rows
        .filter((r) => r.items.length > 0)
        .map((r) => (
          <div key={r.label} className="grid gap-1 sm:grid-cols-[96px_1fr] sm:gap-4">
            <span className="font-semibold text-ink-dim">{r.label}</span>
            <ul className="m-0 flex list-none flex-wrap gap-y-1 divide-x divide-line p-0 *:not-last:mr-3 *:not-last:pr-3">
              {(r.all ? [...r.items, r.all] : r.items).map((i) => (
                <li key={i.href}>
                  <Link href={i.href} prefetch={false}>
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </nav>
  );
}
