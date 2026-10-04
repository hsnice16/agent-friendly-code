import { CopySnippet, type SnippetTone } from "./CopySnippet";
import { Panel, PanelHeading } from "./Panel";

type Props = {
  host: string;
  name: string;
  owner: string;
  appUrl: string;
  repoPagePath: string;
  highlight?: SnippetTone;
};

export function BadgeEmbed({ host, owner, name, appUrl, repoPagePath, highlight = false }: Props) {
  const slug = `${host}/${owner}/${name}`;
  const previewSrc = `/api/badge/${slug}.svg`;
  const absoluteBadgeUrl = `${appUrl}/api/badge/${slug}.svg`;

  const repoPageUrl = `${appUrl}${repoPagePath}`;
  const markdown = `[![Agent Friendly](${absoluteBadgeUrl})](${repoPageUrl})`;

  const tone = highlight || undefined;

  return (
    <Panel tone={tone}>
      <PanelHeading tone={tone}>Add a badge to your README</PanelHeading>
      <p className="m-0 mb-3 text-[13px] text-muted">
        Paste this at the top of the README. It shows the score, and links back to this page.
      </p>

      <div className="mb-3">
        <img height={20} src={previewSrc} alt={`Agent friendly score for ${slug}`} />
      </div>

      <CopySnippet text={markdown} highlight={highlight} />
    </Panel>
  );
}
