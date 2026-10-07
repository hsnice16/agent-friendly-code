import Link from "next/link";

import type { AlternativeRow } from "@/lib/types/db";
import { compactStars } from "@/lib/utils/format";
import { repoPath } from "@/lib/utils/repo-path";

import { Panel, PanelHeading } from "./Panel";
import { ScoreNumber } from "./ScoreNumber";

type Props = {
  language: string | null;
  selectedModelLabel: string;
  alternatives: AlternativeRow[];
  hubHref?: string;
};

export function AlternativesStrip({ language, alternatives, selectedModelLabel, hubHref }: Props) {
  if (alternatives.length === 0) {
    return null;
  }

  return (
    <Panel>
      <PanelHeading>Similar repos</PanelHeading>

      <p className="m-0 mb-3 text-[13px] text-muted">
        Scored for <strong className="text-ink-dim">{selectedModelLabel}</strong>. Same language and host as this repo,
        scoring near it.
      </p>

      <ul className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-3">
        {alternatives.map((a) => (
          <li key={a.id} className="relative rounded-lg border border-line bg-surface-2 px-3.5 py-3">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={repoPath(a)}
                aria-label={`View ${a.owner}/${a.name} details`}
                className="min-w-0 font-medium text-ink hover:text-ink-soft before:absolute before:inset-0 before:content-['']"
              >
                <span className="block truncate">
                  {a.owner}/{a.name}
                </span>
              </Link>

              <ScoreNumber score={a.score ?? 0} size="sm" />
            </div>

            <div className="mt-1 text-[12px] text-muted">
              {language ?? "—"}
              {a.stars != null ? ` · ${compactStars(a.stars)}` : ""}
            </div>
          </li>
        ))}
      </ul>

      {hubHref && language && (
        <Link href={hubHref} className="mt-3 inline-block text-[13px] text-ink-dim hover:text-ink-soft">
          All {language} repos →
        </Link>
      )}
    </Panel>
  );
}
