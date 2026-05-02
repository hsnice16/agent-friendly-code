import Link from "next/link";

import { CopySnippet, type SnippetTone } from "./CopySnippet";
import { Panel, PanelHeading } from "./Panel";

type Props = {
  actionUses: string;
  highlight?: SnippetTone;
  showSecretLink?: boolean;
};

export function ActionEmbed({ actionUses, showSecretLink = false, highlight = false }: Props) {
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
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: ${actionUses}
        with:
          agents-badge-token: \${{ secrets.AGENTS_BADGE_TOKEN }}`;

  return (
    <Panel tone={tone}>
      <PanelHeading tone={tone}>Catch score regressions on every PR</PanelHeading>

      <p className="m-0 mb-3 text-[13px] text-muted">
        Drop the workflow below into your repo and the action will post (or edit) a single comment on each PR with the
        score delta and the per-signal changes — runs entirely inside your CI, no third-party server in the loop.
      </p>

      <CopySnippet text={yaml} highlight={highlight} />

      <p className="mt-3 text-[12.5px] text-muted">
        Set <code className="text-ink-dim mr-0.5">AGENTS_BADGE_TOKEN</code> in the repo&apos;s secrets to enable the
        comment; leave it unset and the action exits silently.
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
