import { CopySnippet } from "./CopySnippet";
import { Panel, PanelHeading } from "./Panel";

type Props = {
  host: string;
  name: string;
  owner: string;
  appUrl: string;
  repoPagePath: string;
};

export function BadgeEmbed({ host, owner, name, appUrl, repoPagePath }: Props) {
  const slug = `${host}/${owner}/${name}`;
  const previewSrc = `/api/badge/${slug}.svg`;
  const absoluteBadgeUrl = `${appUrl}/api/badge/${slug}.svg`;

  const repoPageUrl = `${appUrl}${repoPagePath}`;
  const markdown = `[![Agent Friendly](${absoluteBadgeUrl})](${repoPageUrl})`;

  return (
    <Panel>
      <PanelHeading>Embed this badge</PanelHeading>
      <p className="m-0 mb-3 max-w-[60ch] text-[13px] text-muted">
        Drop the snippet below into the top of this repo&apos;s README so visitors can see its agent-friendliness at a
        glance — clicks land back here.
      </p>

      <div className="mb-3">
        <img height={20} src={previewSrc} alt={`Agent friendly score for ${slug}`} />
      </div>

      <CopySnippet text={markdown} />
    </Panel>
  );
}
