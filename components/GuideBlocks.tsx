import type { ExampleRow } from "@/lib/agents-md-examples";
import type { AgentBoard } from "@/lib/guides/agent-board";
import type { GuideBlock } from "@/lib/guides/types";
import { percent } from "@/lib/utils/format";
import { modelPath } from "@/lib/utils/leaderboard-href";

import { AgentsMdExampleTable } from "./AgentsMdExampleTable";
import { CodeText } from "./CodeText";
import { CopySnippet } from "./CopySnippet";
import { IntentLink } from "./IntentLink";
import { LinkedText } from "./LinkedText";
import { PROSE } from "./prose-class";

type Props = {
  blocks: GuideBlock[];
  /** Fills a string's `{{stat}}` tokens; every string goes through it before render. */
  fill: (text: string) => string;
  examples: (block: Extract<GuideBlock, { kind: "examples" }>) => ExampleRow[];
  board: () => AgentBoard;
};

export function GuideBlocks({ blocks, fill, examples, board }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {blocks.map((b, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: a guide's blocks are static and never reorder
        <Block key={i} b={b} fill={fill} examples={examples} board={board} />
      ))}
    </div>
  );
}

function Block({ b, fill, examples, board }: { b: GuideBlock } & Omit<Props, "blocks">) {
  switch (b.kind) {
    case "p":
      return (
        <p className={PROSE}>
          <LinkedText text={fill(b.text)} />
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
              <LinkedText text={fill(item)} />
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
                      <LinkedText text={fill(cell)} />
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
    case "agentBoard":
      return <AgentBoardTable block={b} board={board()} />;
  }
}

function AgentBoardTable({ block, board }: { block: Extract<GuideBlock, { kind: "agentBoard" }>; board: AgentBoard }) {
  const caption = "Each agent's benchmark standing beside how the leaderboard's repos are set up for it";
  return (
    <div>
      {/* biome-ignore lint/a11y/noNoninteractiveTabindex: keyboard users can only scroll a focusable region */}
      <section className="table-wrap" tabIndex={0} aria-label={caption}>
        <table className="data-table text-[13.5px]">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col">Agent</th>
              <th scope="col">Benchmarks</th>
              <th scope="col">Board average (median)</th>
              <th scope="col">Repos with its own file</th>
            </tr>
          </thead>
          <tbody className="text-ink-dim">
            {board.rows.map((r) => (
              <tr key={r.id}>
                <th scope="row" className="font-medium">
                  <IntentLink href={modelPath(r.id)} className="prose-link">
                    {r.label}
                  </IntentLink>
                </th>
                <td>{block.benchmarks[r.id]}</td>
                <td className="tabular-nums">
                  {r.average.toFixed(1)} ({r.median?.toFixed(1) ?? "—"})
                </td>
                <td>
                  {r.file}: {r.fileCount} ({percent(r.fileCount, board.total)})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <p className="mt-1.5 mb-0 text-[13px] text-muted">
        Board columns: {board.total} repos{board.scoredOn && `, last rescored ${board.scoredOn}`}. Benchmarks: each
        leaderboard as of {block.checked}.
      </p>
    </div>
  );
}
