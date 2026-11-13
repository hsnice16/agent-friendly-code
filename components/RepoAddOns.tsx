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

// The workflow is identical on every repo page, so it lives on /action.
export function RepoAddOns({ host, owner, name, appUrl, repoPagePath, score, page }: Props) {
  const slug = `${host}/${owner}/${name}`;

  return (
    <Panel tone="tip">
      <PanelHeading tone="tip">Add to your repo</PanelHeading>

      <ul className="m-0 list-none space-y-3 p-0 text-[13px] text-muted">
        <li className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <BadgePreview slug={slug} score={score} />
          <span>A README badge that shows the score and links here.</span>
          <CopyButton
            text={badgeMarkdown(appUrl, slug, repoPagePath)}
            event={{ name: "badge_copy", page }}
            className="btn-secondary"
          >
            Copy Markdown
          </CopyButton>
        </li>

        {/* The Action is a GitHub workflow; it cannot run on other hosts. */}
        {host === "github" && (
          <li>
            A GitHub Action that comments on each pull request with how the score changed.{" "}
            <Link href="/action" className="arrow-link">
              Set it up →
            </Link>
          </li>
        )}
      </ul>
    </Panel>
  );
}
