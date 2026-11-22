import type { RepoAboutData } from "@/lib/utils/repo-about";

import { IntentLink } from "./IntentLink";

/** `topicLinks` maps a topic to a page on this site; a topic without one stays plain text. */
export function RepoAbout({ about, topicLinks = {} }: { about: RepoAboutData; topicLinks?: Record<string, string> }) {
  const { description, topics } = about;
  if (!description && topics.length === 0) return null;
  const linked = topics.filter((t) => topicLinks[t]);
  const plain = topics.filter((t) => !topicLinks[t]);

  return (
    <section aria-label="About this repo" className="mt-2.5">
      {description && (
        <p className="m-0 max-w-[72ch] text-[14px] leading-snug text-ink-dim [overflow-wrap:anywhere]">{description}</p>
      )}
      {topics.length > 0 && (
        <ul
          aria-label="Topics"
          // The phone row gap leaves room for a linked chip's 44px tap target.
          className={`m-0 mt-2 flex list-none flex-wrap items-center gap-x-1.5 p-0 sm:gap-y-1.5 ${
            linked.length > 0 ? "gap-y-[23px]" : "gap-y-1.5"
          }`}
        >
          {linked.map((t) => (
            <li key={t} className="flex">
              <IntentLink
                href={topicLinks[t]}
                className="chip tap-target border-line bg-surface-2 text-muted hover:border-line-strong hover:text-ink"
              >
                {t}
              </IntentLink>
            </li>
          ))}
          {/* Not chips: a chip that led nowhere drew clicks that did nothing. */}
          {plain.length > 0 && <li className="text-[11.5px] text-muted">{plain.join(" · ")}</li>}
        </ul>
      )}
    </section>
  );
}
