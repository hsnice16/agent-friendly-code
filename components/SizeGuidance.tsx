import Link from "next/link";

import { checkPath, checkSubPath } from "@/lib/utils/check-path";

import { ExternalLink } from "./ExternalLink";
import { Panel, PanelHeading } from "./Panel";

const PROSE = "m-0 max-w-[76ch] text-[14.5px] leading-relaxed text-ink-dim";

// Official docs only: each line below restates its linked page, so check there before rewording.
const CLAUDE_MEMORY = "https://code.claude.com/docs/en/memory";
const CLAUDE_BEST_PRACTICES = "https://code.claude.com/docs/en/best-practices";
const CODEX_AGENTS_MD = "https://learn.chatgpt.com/docs/agent-configuration/agents-md";
const DEVIN_AGENTS_MD = "https://docs.devin.ai/onboard-devin/agents-md";

export function SizeDocs() {
  return (
    <Panel>
      <PanelHeading>What the agents&apos; docs say</PanelHeading>
      <ul className="m-0 ml-5 flex list-disc flex-col gap-2.5 text-[14.5px] leading-relaxed text-ink-dim">
        <li>
          <strong className="text-ink">Claude Code</strong> targets under 200 lines per CLAUDE.md: longer files
          &ldquo;consume more context and reduce adherence.&rdquo; Instructions for one part of the codebase belong in
          path-scoped rules under <code className="font-mono text-[13px]">.claude/rules/</code>, which load only for
          matching files; <code className="font-mono text-[13px]">@path</code> imports organise a long file but
          don&apos;t shrink what it costs (<ExternalLink href={CLAUDE_MEMORY}>memory docs</ExternalLink>,{" "}
          <ExternalLink href={CLAUDE_BEST_PRACTICES}>best practices</ExternalLink>).
        </li>
        <li>
          <strong className="text-ink">Codex</strong> stops adding instruction files once their combined size reaches{" "}
          <code className="font-mono text-[13px]">project_doc_max_bytes</code>, 32 KiB by default. Its fix: raise the
          setting or split large files across nested directories (
          <ExternalLink href={CODEX_AGENTS_MD}>Codex docs</ExternalLink>).
        </li>
        <li>
          <strong className="text-ink">Devin</strong> includes the first 16 KiB of each AGENTS.md; what comes after it
          reads only on demand. It advises keeping critical instructions near the top and always-on guidance under 16
          KiB (<ExternalLink href={DEVIN_AGENTS_MD}>Devin docs</ExternalLink>).
        </li>
      </ul>
    </Panel>
  );
}

export function SizeAdvice({ median }: { median: string }) {
  return (
    <Panel tone="tip">
      <PanelHeading tone="tip" icon="ruler">
        So how long should yours be?
      </PanelHeading>
      <ul className="m-0 ml-5 flex list-disc flex-col gap-2 text-[14.5px] leading-relaxed text-ink-dim">
        <li>
          Short enough that every line earns its place. The typical file here is about {median} characters; past 16 KiB,
          Devin no longer loads all of it up front.
        </li>
        <li>
          Commands first: install, test, a single test, lint and typecheck. Then what the code can&apos;t tell an agent:
          traps, decisions, the rules that keep getting broken.
        </li>
        <li>
          Leave out what an agent can read from the code or the README, and move rules for one directory into that
          directory&apos;s own file.
        </li>
        <li>
          Under 800 characters, the{" "}
          <Link href={checkPath("agents_md")} className="prose-link">
            AGENTS.md check
          </Link>{" "}
          gives partial credit: a file that short rarely holds the commands and the traps.
        </li>
      </ul>
      <p className={`${PROSE} mt-3`}>
        <Link href={checkSubPath("agents_md", "examples")} className="arrow-link">
          Real AGENTS.md examples →
        </Link>
      </p>
    </Panel>
  );
}
