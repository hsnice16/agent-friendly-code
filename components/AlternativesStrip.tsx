import Link from "next/link";

import type { AlternativeRow } from "@/lib/types/db";
import { compactStars } from "@/lib/utils/format";
import { repoPath } from "@/lib/utils/repo-path";

import { Panel, PanelHeading } from "./Panel";
import { ScoreNumber } from "./ScoreNumber";

type Props = {
  language: string | null;
  /** `detail` replaces the language-and-stars line under the name. */
  alternatives: (AlternativeRow & { detail?: string })[];
  note: string;
  hubHref?: string;
};

export function AlternativesStrip({ language, alternatives, note, hubHref }: Props) {
  if (alternatives.length === 0) {
    return null;
  }

  return (
    <Panel>
      <PanelHeading>Similar repos</PanelHeading>

      <p className="m-0 mb-3 text-[13px] text-muted">{note}</p>

      <ul className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-3">
        {alternatives.map((a) => (
          <li key={a.id} className="relative tile">
            <div className="flex items-start justify-between gap-2">
              <Link
                href={repoPath(a)}
                aria-label={`View ${a.owner}/${a.name} details`}
                className="min-w-0 truncate font-medium ink-link cover-link"
              >
                {a.owner}/{a.name}
              </Link>

              <ScoreNumber score={a.score ?? 0} size="sm" />
            </div>

            <div className="mt-1 text-[12px] text-muted">
              {a.detail ?? (
                <>
                  {(a.language === undefined ? language : a.language) ?? "—"}
                  {a.stars != null ? ` · ${compactStars(a.stars)}` : ""}
                </>
              )}
            </div>
          </li>
        ))}
      </ul>

      {hubHref && language && (
        <Link href={hubHref} className="mt-3 inline-block text-[13px] arrow-link">
          All {language} repos →
        </Link>
      )}
    </Panel>
  );
}
