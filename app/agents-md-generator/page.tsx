import type { Metadata } from "next";
import Link from "next/link";

import { CompanionFiles } from "@/components/CompanionFiles";
import { CopySnippet } from "@/components/CopySnippet";
import { JsonLd } from "@/components/JsonLd";
import { LiveScoreForm } from "@/components/LiveScoreForm";
import { PageHeader } from "@/components/PageHeader";
import { Panel, PanelHeading } from "@/components/Panel";
import { PAGE_COPY, staticPageMetadata } from "@/lib/page-meta";
import { PUBLISHER_JSON_LD } from "@/lib/site-json-ld";
import { starterIfMissing } from "@/lib/starter-agents-md";
import { agentInstructions } from "@/lib/utils/agent-instructions";
import { checkPath, checkSubPath } from "@/lib/utils/check-path";
import { GENERATOR_PATH } from "@/lib/utils/generator-path";
import { agentFileShare, loadAbout, loadBoard, loadSignals } from "@/lib/utils/repo-page-data";
import { repoPath } from "@/lib/utils/repo-path";
import { APP_URL } from "@/lib/version";

const PATH = GENERATOR_PATH;
const PROSE = "m-0 max-w-[76ch] text-[14.5px] leading-relaxed text-ink-dim";

export const metadata: Metadata = staticPageMetadata(PATH);

// The top-scoring board repo that gets a starter, so the example is real output
// and moves on by itself once that repo commits an AGENTS.md.
function example() {
  for (const repo of loadBoard()) {
    const signals = loadSignals(repo.id);
    const starter = starterIfMissing(
      agentInstructions(signals, agentFileShare(repo.language)),
      { ...repo, description: loadAbout(repo).description },
      signals,
    );
    if (starter) return { repo, starter };
  }
  return null;
}

const DRAFT = [
  "A first line naming the repo, with its description's first sentence and main language.",
  "Where things are: the dependency manifest, tests, lint and type config, CI, commit hooks, dev setup and CONTRIBUTING guide, each only if the scan found it.",
  "A Commands section with Install, Test and Lint left as TODO.",
];

export default function AgentsMdGeneratorPage() {
  const shown = example();

  return (
    <>
      <JsonLd
        data={{
          "@type": "WebApplication",
          url: `${APP_URL}${PATH}`,
          name: "AGENTS.md generator",
          description: PAGE_COPY[PATH].description,
          isAccessibleForFree: true,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          publisher: PUBLISHER_JSON_LD,
        }}
      />

      <PageHeader
        crumbs={{ current: { name: "AGENTS.md generator", path: PATH } }}
        title={PAGE_COPY[PATH].title}
        lead="A free AGENTS.md generator: paste a public GitHub repo URL and, if the repo has no AGENTS.md or CLAUDE.md, its score page drafts a starter AGENTS.md from what the scan finds, ready to copy. No signup. It also gives the one-line CLAUDE.md and the Gemini CLI setting that point those agents at it."
      >
        <LiveScoreForm />
      </PageHeader>

      <div className="grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2">
        <Panel className="h-full">
          <PanelHeading>What goes in the draft</PanelHeading>
          <ul className="m-0 ml-5 list-disc text-[14.5px] leading-relaxed text-ink-dim">
            {DRAFT.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Panel>

        <Panel className="h-full">
          <PanelHeading>What it leaves to you</PanelHeading>
          <p className={PROSE}>
            The scan records where a file is, not what it runs, so the draft never guesses a command. Copy the exact
            install, test and lint commands from your CI, then add the rules a reviewer keeps repeating.{" "}
            <Link href={checkPath("agents_md")} className="prose-link">
              What to put in an AGENTS.md
            </Link>
            .
          </p>
        </Panel>
      </div>

      {shown && (
        <div className="mt-3.5">
          <Panel>
            <PanelHeading>
              Example: the draft for <span className="normal-case">{`${shown.repo.owner}/${shown.repo.name}`}</span>
            </PanelHeading>
            <p className="m-0 mb-2 text-[13px] text-muted">
              The highest-scoring repo on the leaderboard without a usable AGENTS.md or CLAUDE.md.{" "}
              <Link href={repoPath(shown.repo)} className="arrow-link">
                Its score →
              </Link>
            </p>
            <CopySnippet
              wrap
              text={shown.starter}
              label="Example AGENTS.md"
              event={{ name: "copy_install", tool: "starter_agents_md" }}
            />
          </Panel>
        </div>
      )}

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Do I also need a CLAUDE.md, GEMINI.md or Copilot file?</PanelHeading>
          <p className="m-0 mb-3 max-w-[76ch] text-[14px] leading-relaxed text-muted">
            Keep one AGENTS.md. Gemini CLI needs a setting to read it, and Claude Code an import if you also keep a
            CLAUDE.md; Copilot, Cursor and Codex read it as is.{" "}
            <Link href={checkSubPath("agents_md", "vs-claude-md")} className="prose-link">
              AGENTS.md vs CLAUDE.md
            </Link>
            .
          </p>
          <CompanionFiles />
        </Panel>
      </div>
    </>
  );
}
