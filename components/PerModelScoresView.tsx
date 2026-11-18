"use client";

import Link from "next/link";

import type { ModelId } from "@/lib/scoring/weights";
import { modelPath } from "@/lib/utils/leaderboard-href";

import { Panel, PanelHeading } from "./Panel";
import { ScoreBar } from "./ScoreBar";
import { ScoreNumber } from "./ScoreNumber";

const MARK = {
  ok: { cls: "tint-ok", ch: "✓", label: "Has" },
  partial: { cls: "tint-warn", ch: "~", label: "Partly has" },
  bad: { cls: "tint-bad", ch: "✗", label: "Missing" },
} as const;

function mark(pass: number) {
  return pass >= 1 ? MARK.ok : pass > 0 ? MARK.partial : MARK.bad;
}

export type AgentScoreRow = {
  id: ModelId;
  label: string;
  score: number | null;
  rank?: { rank: number; total: number };
  checks: { id: string; label: string; pass: number }[];
};

export function PerModelScoresView({ rows }: { rows: AgentScoreRow[] }) {
  return (
    <Panel>
      <PanelHeading>Score for each AI agent</PanelHeading>

      <p className="m-0 mb-1 text-[13.5px] text-muted">
        Each agent weighs the checks by its own docs. Under each score are its top three.{" "}
        <Link href="/methodology#agents" className="arrow-link">
          How each agent is scored →
        </Link>
      </p>

      <div>
        {rows.map(({ id, label, score: s, rank, checks }) => (
          <div key={id} className="agent-row link-row">
            <div className="text-[14.5px]">
              <Link
                href={modelPath(id)}
                aria-label={`${label} leaderboard`}
                className="font-medium ink-link cover-link"
              >
                {label}
              </Link>
              {rank && (
                <div className="mt-0.5 text-[12px] text-muted">
                  #{rank.rank} of {rank.total}
                </div>
              )}
            </div>

            {s === null ? (
              <div className="bar-place bar-track w-[180px]" aria-hidden />
            ) : (
              <ScoreBar score={s} width={180} className="bar-place" />
            )}

            {s === null ? (
              <span className="score-num text-[15px] text-muted">
                <span aria-hidden="true">—</span>
                <span className="sr-only">Not scored yet</span>
              </span>
            ) : (
              <ScoreNumber score={s} />
            )}

            <ul className="agent-checks">
              {checks.map((sig) => {
                const k = mark(sig.pass);

                // role="img" makes the glyph presentational, so the label alone is read.
                return (
                  <li key={sig.id}>
                    <span role="img" aria-label={k.label} className={`mark-sm ${k.cls}`}>
                      {k.ch}
                    </span>
                    {sig.label}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}
