import type { ExampleRow } from "@/lib/agents-md-examples";
import type { GuideBlock } from "@/lib/guides/types";

import { AgentsMdExampleTable } from "./AgentsMdExampleTable";
import { CodeText } from "./CodeText";
import { CopySnippet } from "./CopySnippet";

const PROSE = "m-0 max-w-[76ch] text-[14.5px] leading-relaxed text-ink-dim";

type Props = {
  blocks: GuideBlock[];
  /** Fills a string's `{{stat}}` tokens; every string goes through it before render. */
  fill: (text: string) => string;
  examples: (block: Extract<GuideBlock, { kind: "examples" }>) => ExampleRow[];
};

export function GuideBlocks({ blocks, fill, examples }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {blocks.map((b, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: a guide's blocks are static and never reorder
        <Block key={i} b={b} fill={fill} examples={examples} />
      ))}
    </div>
  );
}

function Block({ b, fill, examples }: { b: GuideBlock } & Omit<Props, "blocks">) {
  switch (b.kind) {
    case "p":
      return (
        <p className={PROSE}>
          <CodeText text={fill(b.text)} />
        </p>
      );
    case "list": {
      const Tag = b.ordered ? "ol" : "ul";
      return (
        <Tag
          className={`m-0 ml-5 ${b.ordered ? "list-decimal" : "list-disc"} max-w-[76ch] text-[14.5px] leading-relaxed text-ink-dim`}
        >
          {b.items.map((item, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static items; the text itself may hold an unfilled {{stat}}
            <li key={i}>
              <CodeText text={fill(item)} />
            </li>
          ))}
        </Tag>
      );
    }
    case "table":
      return (
        // biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users can only scroll a focusable region
        <section className="table-wrap" tabIndex={0} aria-label={b.caption ? fill(b.caption) : b.head.join(", ")}>
          <table className="data-table text-[13.5px]">
            {b.caption && <caption className="sr-only">{fill(b.caption)}</caption>}
            <thead>
              <tr>
                {b.head.map((h) => (
                  <th key={h} scope="col">
                    <CodeText text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((row, r) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: static rows; a label may hold an unfilled {{stat}}
                <tr key={r}>
                  {row.map((cell, c) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: columns are fixed by the head
                    <td key={c} className={c === 0 ? "font-medium text-ink" : "text-ink-dim"}>
                      <CodeText text={fill(cell)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      );
    case "snippet":
      return (
        <div>
          <p className="m-0 mb-1.5 text-[12.5px] font-medium text-muted">
            <code className="text-ink-dim [overflow-wrap:anywhere]">{b.caption}</code>
          </p>
          <CopySnippet text={b.text} wrap={b.wrap} />
        </div>
      );
    case "examples":
      return (
        <AgentsMdExampleTable
          rows={examples(b)}
          caption={`Repos on the board with a ${b.file}`}
          showLanguage={b.language == null}
        />
      );
  }
}
