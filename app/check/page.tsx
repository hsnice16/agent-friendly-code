import type { Metadata } from "next";
import Link from "next/link";

import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { CodeText } from "@/components/CodeText";
import { getCheckStats } from "@/lib/check-stats";
import { SIGNALS } from "@/lib/scoring/signals";
import { checkPath } from "@/lib/utils/check-path";
import { percent } from "@/lib/utils/format";
import { DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

const TITLE = "What makes a repo ready for AI coding agents";
const DESCRIPTION =
  "The sixteen things we check in a repo, from AGENTS.md and Cursor rules to tests, CI and a reproducible dev setup, with how many popular open source repos pass each one.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/check" },
  twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title: TITLE, description: DESCRIPTION },
  openGraph: {
    ...OG_DEFAULTS,
    images: [DEFAULT_OG_IMAGE],
    title: TITLE,
    description: DESCRIPTION,
    url: "/check",
    type: "website",
  },
};

export default function ChecksPage() {
  const total = getCheckStats(SIGNALS[0].id).total;

  return (
    <>
      <BreadcrumbJsonLd current={{ name: "Checks", path: "/check" }} />

      <section className="my-3 mb-7">
        <h1 className="mb-2.5 text-[30px] font-bold leading-[1.18] tracking-tight">{TITLE}</h1>
        <p className="m-0 max-w-[72ch] text-[15.5px] text-ink-dim">
          Every score on this site comes from {SIGNALS.length} checks on the files in a repo. Each one has its own page:
          what it looks for, why agents need it, how to pass it, and how many of the {total} repos on the leaderboard
          do. The{" "}
          <Link href="/methodology" className="text-ink-dim underline underline-offset-4 hover:text-ink-soft">
            methodology
          </Link>{" "}
          covers how the checks are weighted into a score.
        </p>
      </section>

      <ul className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-2">
        {SIGNALS.map((s) => {
          const stats = getCheckStats(s.id);
          return (
            <li key={s.id} className="relative rounded-lg border border-line bg-surface px-4 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={checkPath(s.id)}
                  className="font-medium text-ink hover:text-ink-soft before:absolute before:inset-0 before:content-['']"
                >
                  {s.label}
                </Link>
                <span className="shrink-0 text-[13px] tabular-nums text-ink-dim">
                  {percent(stats.full, stats.total)} pass
                </span>
              </div>
              <p className="mt-1 mb-0 text-[13px] text-muted">
                <CodeText text={s.description} />
              </p>
            </li>
          );
        })}
      </ul>
    </>
  );
}
