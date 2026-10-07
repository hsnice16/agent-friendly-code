import type { Metadata } from "next";
import Link from "next/link";

import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { Panel, PanelHeading } from "@/components/Panel";
import { ScoreNumber } from "@/components/ScoreNumber";
import { LANGUAGE_HUB_MIN_REPOS } from "@/lib/constants/scoring";
import { getLanguageGroups, getReposWithoutLanguage } from "@/lib/language-hubs";
import { averageScore, hubPath, isHub } from "@/lib/utils/language";
import { repoPath } from "@/lib/utils/repo-path";
import { DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const TITLE = "Agent-friendly repos by language";
const DESCRIPTION =
  "Browse the agent-friendliness leaderboard by programming language: TypeScript, Python, Rust, Go, Java and more, each ranked for AI coding agents like Claude Code, Cursor and Codex.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/language" },
  twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title: TITLE, description: DESCRIPTION },
  openGraph: {
    ...OG_DEFAULTS,
    images: [DEFAULT_OG_IMAGE],
    title: TITLE,
    description: DESCRIPTION,
    url: "/language",
    type: "website",
  },
};

const LINK_CLASS = "text-ink-dim hover:text-ink-soft";

export default function LanguagesPage() {
  const groups = getLanguageGroups();
  const hubs = groups.filter(isHub);
  const small = groups.filter((g) => !isHub(g));
  const unknown = getReposWithoutLanguage();
  if (unknown.length > 0) {
    small.push({ slug: "unknown", label: "Language not detected", rows: unknown });
  }

  return (
    <>
      <BreadcrumbJsonLd current={{ name: "Languages", path: "/language" }} />

      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">{TITLE}</h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          The leaderboard, one language at a time. Each page ranks that language&apos;s repos and shows the checks they
          most often miss.
        </p>
      </section>

      <ul className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-2 md:grid-cols-3">
        {hubs.map((g) => (
          <li key={g.slug} className="relative rounded-lg border border-line bg-surface px-4 py-3.5">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={hubPath(g.slug)}
                className="font-medium text-ink hover:text-ink-soft before:absolute before:inset-0 before:content-['']"
              >
                {g.label}
              </Link>
              <ScoreNumber score={averageScore(g.rows)} size="sm" />
            </div>
            <div className="mt-1 text-[12px] text-muted">{g.rows.length} repos · average score</div>
          </li>
        ))}
      </ul>

      {small.length > 0 && (
        <div className="mt-3.5">
          <Panel>
            <PanelHeading>Fewer than {LANGUAGE_HUB_MIN_REPOS} repos</PanelHeading>
            <dl className="m-0 flex flex-col gap-2 text-[14px]">
              {small.map((g) => (
                <div key={g.slug}>
                  <dt className="inline font-medium text-ink">{g.label}: </dt>
                  <dd className="inline text-ink-dim">
                    {g.rows.map((r, i) => (
                      <span key={r.id}>
                        {i > 0 && ", "}
                        <Link href={repoPath(r)} className={LINK_CLASS}>
                          {r.owner}/{r.name}
                        </Link>
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>
      )}
    </>
  );
}
