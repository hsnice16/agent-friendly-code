import Link from "next/link";

import type { RepoAboutData } from "@/lib/utils/repo-about";

const CHIP = "chip border-line bg-surface-2 text-muted";

/** `topicLinks` maps a topic to a page on this site; a topic without one stays plain text. */
export function RepoAbout({ about, topicLinks = {} }: { about: RepoAboutData; topicLinks?: Record<string, string> }) {
  const { description, topics } = about;
  if (!description && topics.length === 0) return null;

  return (
    <section aria-label="About this repo" className="mt-2.5">
      {description && <p className="m-0 max-w-[72ch] text-[14px] leading-snug text-ink-dim">{description}</p>}
      {topics.length > 0 && (
        <ul
          aria-label="Topics"
          // The phone row gap leaves room for a linked chip's 44px tap target.
          className={`m-0 mt-2 flex list-none flex-wrap gap-x-1.5 p-0 sm:gap-y-1.5 ${
            topics.some((t) => topicLinks[t]) ? "gap-y-[23px]" : "gap-y-1.5"
          }`}
        >
          {topics.map((t) => (
            <li key={t}>
              {topicLinks[t] ? (
                <Link href={topicLinks[t]} className={`${CHIP} tap-target hover:border-line-strong hover:text-ink`}>
                  {t}
                </Link>
              ) : (
                <span className={CHIP}>{t}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
