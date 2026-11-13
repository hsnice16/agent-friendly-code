import { CopySnippet, type SnippetTone } from "./CopySnippet";
import { Panel, PanelHeading } from "./Panel";

type Props = {
  actionUses: string;
  highlight?: SnippetTone;
};

export function ActionEmbed({ actionUses, highlight = false }: Props) {
  const tone = highlight || undefined;
  const yaml = `# .github/workflows/agent-friendly.yml
name: Agent-friendly score diff

on:
  pull_request:
    branches: [main]

permissions:
  contents: read
  pull-requests: write

jobs:
  score-diff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
        with:
          fetch-depth: 0
      - uses: ${actionUses}
        with:
          agents-badge-token: \${{ secrets.AGENTS_BADGE_TOKEN }}`;

  return (
    <Panel tone={tone}>
      <PanelHeading tone={tone}>Check the score on every pull request</PanelHeading>

      <p className="m-0 mb-3 text-[13px] text-muted">
        Add this file. Each pull request gets one comment on how the score changed and why.
      </p>

      <CopySnippet text={yaml} highlight={highlight} event={{ name: "copy_install", tool: "action" }} />

      <p className="mt-3 text-[12.5px] text-muted">
        Add <code className="text-ink-dim mr-0.5">AGENTS_BADGE_TOKEN</code> to the repo&apos;s secrets to turn the
        comment on. Without it, the action does nothing.
      </p>
    </Panel>
  );
}
