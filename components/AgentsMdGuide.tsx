import Link from "next/link";

import { AGENTS_MD_INCLUDE, AGENTS_MD_LEAVE_OUT } from "@/lib/check-content/agents-md-guide";
import { checkSubPath } from "@/lib/utils/check-path";

import { CodeText } from "./CodeText";
import { Panel, PanelHeading } from "./Panel";

const LINK = "text-ink hover:text-ink-soft";
const NUMBER = new Intl.NumberFormat("en-US");

export function AgentsMdGuide({ medianLength, files }: { medianLength: number | null; files: number }) {
  const examples = checkSubPath("agents_md", "examples");

  return (
    <Panel>
      <PanelHeading>What should I put in an AGENTS.md?</PanelHeading>
      <p className="m-0 mb-3 max-w-[76ch] text-[14.5px] leading-relaxed text-ink">
        Whatever an agent can&apos;t work out from the code, kept short enough to read in full every session:
      </p>
      <ul className="m-0 ml-5 list-disc text-[14.5px] leading-relaxed text-ink-dim">
        {AGENTS_MD_INCLUDE.map((item) => (
          <li key={item.label}>
            <strong className="text-ink">{item.label}.</strong> <CodeText text={item.text} />
          </li>
        ))}
      </ul>
      <h3 className="mt-4 mb-2 text-[14px] font-semibold text-ink">What to leave out</h3>
      <ul className="m-0 ml-5 list-disc text-[14.5px] leading-relaxed text-ink-dim">
        {AGENTS_MD_LEAVE_OUT.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      {medianLength != null && (
        <p className="mt-3 mb-0 text-[13.5px] text-ink-dim">
          The median of the {files} on the leaderboard is {NUMBER.format(medianLength)} characters.{" "}
          <Link href={examples} className={LINK}>
            Read them
          </Link>
          .
        </p>
      )}
    </Panel>
  );
}
