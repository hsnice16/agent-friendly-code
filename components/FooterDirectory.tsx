import Link from "next/link";

import { VS_AGENTS_MD } from "@/lib/check-content/vs-agents-md";
import { SIGNALS } from "@/lib/scoring/signals";
import { MODELS } from "@/lib/scoring/weights";
import { TOPICS_PATH } from "@/lib/topics";
import { checkPath, checkSubPath, frameworkExamplesPath } from "@/lib/utils/check-path";
import { modelPath } from "@/lib/utils/leaderboard-href";
import { REPORT_PATH, REPORT_TITLE } from "@/lib/utils/report-path";

type Item = { label: string; href: string };

type Props = {
  frameworks: { slug: string; label: string }[];
};

// Languages and topics get only their hub: the footer is in every page's bytes
// twice (HTML and RSC payload), and the hubs, the sitemap and each repo page's
// own chips already link every one of them.
export function FooterDirectory({ frameworks }: Props) {
  const rows: { label: string; items: Item[]; all: Item }[] = [
    {
      label: "Agents",
      items: MODELS.map((m) => ({ label: m.label, href: modelPath(m.id) })),
      all: { label: "Files each reads →", href: "/agents" },
    },
    {
      label: "Languages",
      items: [],
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
      items: [],
      all: { label: "All topics →", href: TOPICS_PATH },
    },
  ];

  return (
    <nav
      aria-label="Directory"
      className="mb-8 flex flex-col gap-4 border-b border-line pb-8 [&_a]:hover:text-ink-soft"
    >
      {rows.map((r) => (
        <div key={r.label} className="dir-row">
          <span className="font-semibold text-ink-dim">{r.label}</span>
          <ul className="dir-list">
            {[...r.items, r.all].map((i) => (
              <li key={i.href}>
                <Link href={i.href} prefetch={false} className="tap-target">
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
