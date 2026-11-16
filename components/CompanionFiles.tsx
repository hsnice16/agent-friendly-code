import { COMPANION_FILES } from "@/lib/starter-agents-md";

import { CodeText } from "./CodeText";
import { CopySnippet } from "./CopySnippet";
import { ExternalLink } from "./ExternalLink";

export function CompanionFiles() {
  return (
    <ul className="m-0 flex list-none flex-col gap-3 p-0">
      {COMPANION_FILES.map((c) => (
        <li key={c.agent} className="text-[14px] leading-relaxed text-ink-dim">
          <span className="font-semibold text-ink">{c.agent}</span>
          {c.file && (
            <>
              {" · "}
              <code className="font-mono text-[13px] text-ink">{c.file}</code>
            </>
          )}
          <span className="block">
            <CodeText text={c.note} />{" "}
            <ExternalLink href={c.source}>
              Docs<span className="sr-only"> for {c.agent}</span>
            </ExternalLink>
          </span>
          {c.text && (
            <div className="mt-1.5">
              <CopySnippet text={c.text} label={c.file} event={{ name: "copy_install", tool: "starter_agents_md" }} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
