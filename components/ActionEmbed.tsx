import Link from "next/link";

import { CopySnippet, type SnippetTone } from "./CopySnippet";
import { Panel, PanelHeading } from "./Panel";

type Props = {
  actionUses: string;
  branch?: string | null;
  highlight?: SnippetTone;
  showSecretLink?: boolean;
};

export function ActionEmbed({ actionUses, branch, showSecretLink = false, highlight = false }: Props) {
  const tone = highlight || undefined;
  const yaml = `# .github/workflows/agent-friendly.yml
name: Agent-friendly score diff

on:
  pull_request:
    branches: [${branch || "main"}]

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
        Add this file to your repo. On each pull request, it posts one comment showing how the score changed and why. It
        runs in your own CI, with no outside server involved.
      </p>

      <CopySnippet text={yaml} highlight={highlight} />

      <p className="mt-3 text-[12.5px] text-muted">
        Add <code className="text-ink-dim mr-0.5">AGENTS_BADGE_TOKEN</code> to the repo&apos;s secrets to turn the
        comment on. Without it, the action does nothing.
        {showSecretLink && (
          <>
            {" "}
            <Link
              href="/action#set-secret"
              className="border-b border-dotted border-ink-dim/60 text-ink-dim hover:border-ink-soft hover:text-ink-soft"
            >
              Where do I add it?
            </Link>
          </>
        )}
      </p>
    </Panel>
  );
}
