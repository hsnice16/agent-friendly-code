import Link from "next/link";

import { SIGNALS } from "@/lib/scoring/signals";
import { MODELS } from "@/lib/scoring/weights";
import { TOPICS_PATH, topicPath } from "@/lib/topics";
import { checkPath } from "@/lib/utils/check-path";
import { hubPath } from "@/lib/utils/language";
import { modelPath } from "@/lib/utils/leaderboard-href";

type Item = { label: string; href: string };

type Props = {
  hubs: { slug: string; label: string }[];
  topics: { slug: string; label: string }[];
};

// Full lists, not previews: a link from every page is what gets these pages
// crawled. Under the home board the same lists read as clutter.
export function FooterDirectory({ hubs, topics }: Props) {
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
      all: { label: "All checks →", href: "/check" },
    },
    {
      label: "Topics",
      items: topics.map((t) => ({ label: t.label, href: topicPath(t.slug) })),
      all: { label: "All topics →", href: TOPICS_PATH },
    },
  ];

  return (
    <nav aria-label="Directory" className="mb-8 flex flex-col gap-4 border-b border-line pb-8">
      {rows
        .filter((r) => r.items.length > 0)
        .map((r) => (
          <div key={r.label} className="grid gap-1 sm:grid-cols-[96px_1fr] sm:gap-4">
            <span className="font-semibold text-ink-dim">{r.label}</span>
            <ul className="m-0 flex list-none flex-wrap gap-y-1 p-0">
              {(r.all ? [...r.items, r.all] : r.items).map((i) => (
                <li key={i.href} className="mr-3 border-r border-line pr-3 last:mr-0 last:border-r-0 last:pr-0">
                  <Link href={i.href} prefetch={false} className="hover:text-ink-soft">
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
