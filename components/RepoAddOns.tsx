import Link from "next/link";

import { badgeMarkdown } from "@/lib/utils/badge";

import { BadgePreview } from "./BadgePreview";
import { CopyButton } from "./CopyButton";
import { Panel, PanelHeading } from "./Panel";

type Props = {
  host: string;
  owner: string;
  name: string;
  appUrl: string;
  repoPagePath: string;
  /** What the badge prints, so the preview reserves its real width. */
  score: number | null;
  /** Which page sent the copy event. */
  page: "repo" | "live_score";
};

const CARD = "tile flex flex-col";
const CARD_TITLE = "m-0 text-[14.5px] font-semibold text-ink";
const CARD_TEXT = "m-0 mt-1 text-[13.5px] leading-relaxed text-ink-dim";

// The workflow is identical on every repo page, so it lives on /action.
export function RepoAddOns({ host, owner, name, appUrl, repoPagePath, score, page }: Props) {
  const slug = `${host}/${owner}/${name}`;

  return (
    <Panel tone="tip">
      <PanelHeading tone="tip" icon="puzzle">
        Add to your repo
      </PanelHeading>

      {/* Same shape for both: what it is, what it does, one action, so neither reads as the footnote. */}
      <ul className="m-0 grid list-none grid-cols-1 gap-2.5 p-0 md:grid-cols-2">
        <li className={CARD}>
          <h3 className={CARD_TITLE}>README badge</h3>
          <p className={CARD_TEXT}>Shows the score and links here.</p>
          <div className="mt-auto flex flex-wrap items-center gap-3 pt-3">
            <BadgePreview slug={slug} score={score} />
            <CopyButton
              text={badgeMarkdown(appUrl, slug, repoPagePath)}
              event={{ name: "badge_copy", page }}
              className="btn-secondary btn-sm"
            >
              Copy Markdown
            </CopyButton>
          </div>
        </li>

        {/* The Action is a GitHub workflow; it cannot run on other hosts. */}
        {host === "github" && (
          <li className={CARD}>
            <h3 className={CARD_TITLE}>GitHub Action</h3>
            <p className={CARD_TEXT}>Comments on each pull request with how the score changed.</p>
            <div className="mt-auto pt-3">
              <Link href="/action" className="btn-secondary btn-sm">
                Set it up →
              </Link>
            </div>
          </li>
        )}
      </ul>
    </Panel>
  );
}
