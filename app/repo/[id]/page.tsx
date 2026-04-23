import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { HostPill } from "@/components/HostPill";
import { ModelPills } from "@/components/ModelPills";
import { Panel, PanelHeading } from "@/components/Panel";
import { ScoreBar } from "@/components/ScoreBar";
import { ScoreNumber } from "@/components/ScoreNumber";
import { SignalRow } from "@/components/SignalRow";
import { SuggestionItem } from "@/components/SuggestionItem";

import { STRENGTHS_GAPS_VISIBLE_LIMIT } from "@/lib/constants/scoring";
import { getModelScores, getRepo, getSignalResults } from "@/lib/db";
import { topImprovements } from "@/lib/scoring/scorer";
import { MODEL_BY_ID, MODELS, type ModelId } from "@/lib/scoring/weights";
import { compactStars, relativeTime } from "@/lib/utils/format";
import { scoreTier, TIER_TEXT_CLASS } from "@/lib/utils/score";

function StrengthsCard({
  empty,
  items,
}: {
  empty: { chip: "ok" | "bad"; text: string };
  items: Array<{ id: string; label: string }>;
}) {
  return (
    <Panel className="h-full">
      <PanelHeading>Strengths</PanelHeading>
      <ul className="m-0 list-none p-0">
        {items.length === 0 ? (
          <EmptyRow chip={empty.chip}>{empty.text}</EmptyRow>
        ) : (
          items.map((s) => (
            <li key={s.id} className="flex items-center gap-3 border-b border-line py-2 text-[14.5px] last:border-b-0">
              <span
                role="img"
                aria-label="Pass"
                className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-ok/15 text-xs font-bold text-ok"
              >
                <span aria-hidden="true">✓</span>
              </span>
              <span>{s.label}</span>
            </li>
          ))
        )}
      </ul>
    </Panel>
  );
}

function GapsCard({
  empty,
  items,
}: {
  empty: { chip: "ok" | "bad"; text: string };
  items: Array<{ id: string; label: string }>;
}) {
  return (
    <Panel className="h-full">
      <PanelHeading>Gaps</PanelHeading>

      <ul className="m-0 list-none p-0">
        {items.length === 0 ? (
          <EmptyRow chip={empty.chip}>{empty.text}</EmptyRow>
        ) : (
          items.map((s) => (
            <li key={s.id} className="flex items-center gap-3 border-b border-line py-2 text-[14.5px] last:border-b-0">
              <span
                role="img"
                aria-label="Missing"
                className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-bad/15 text-xs font-bold text-bad"
              >
                <span aria-hidden="true">✗</span>
              </span>
              <span>{s.label}</span>
            </li>
          ))
        )}
      </ul>
    </Panel>
  );
}

function EmptyRow({ chip, children }: { chip: "ok" | "bad"; children: React.ReactNode }) {
  const ch = chip === "ok" ? "✓" : "✗";
  const cls = chip === "ok" ? "bg-ok/15 text-ok" : "bg-bad/15 text-bad";

  return (
    <li className="flex items-center gap-3 py-2 text-[14.5px] text-muted">
      <span
        aria-hidden="true"
        className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-xs font-bold ${cls}`}
      >
        {ch}
      </span>
      <span>{children}</span>
    </li>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id: idStr } = await params;
  const id = Number(idStr);

  if (!Number.isFinite(id)) {
    return {};
  }

  const repo = getRepo(id);
  if (!repo) {
    return {};
  }

  const slug = `${repo.owner}/${repo.name}`;
  const score = repo.overall_score != null ? repo.overall_score.toFixed(1) : "unranked";

  const title = `${slug} — ${score} / 100`;
  const description = `Agent-friendliness score for ${slug} across Claude Code, Cursor, Devin, and GPT-5 Codex — with the top improvements ranked by score-gain.`;

  return {
    title,
    description,
    twitter: { title, description },
    alternates: { canonical: `/repo/${id}` },
    openGraph: { title, description, url: `/repo/${id}`, type: "article" },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ model?: string }>;
}) {
  const { id: idStr } = await params;
  const { model } = await searchParams;
  const id = Number(idStr);

  if (!Number.isFinite(id)) {
    notFound();
  }

  const repo = getRepo(id);
  if (!repo) {
    notFound();
  }

  const selected: ModelId = model && model in MODEL_BY_ID ? (model as ModelId) : "claude-code";

  const signals = getSignalResults(id);
  const modelScores = getModelScores(id);

  const overall = repo.overall_score ?? 0;
  const overallTier = scoreTier(overall);
  const suggestions = topImprovements(selected, signals, 3);

  const strengths = signals.filter((s) => s.pass >= 1).slice(0, STRENGTHS_GAPS_VISIBLE_LIMIT);
  const gaps = signals.filter((s) => s.pass === 0).slice(0, STRENGTHS_GAPS_VISIBLE_LIMIT);

  return (
    <>
      <Link
        href="/"
        className="my-5 inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink hover:no-underline"
      >
        ← back to leaderboard
      </Link>

      {/* Hero */}
      <Panel padding={false}>
        <div className="flex flex-col gap-5 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-6">
          <div className="min-w-0 flex-1">
            <h1 className="m-0 break-words text-[20px] font-semibold tracking-tight sm:text-[22px]">
              {repo.owner}/{repo.name}
              <HostPill host={repo.host} />
            </h1>

            <a
              rel="noopener"
              target="_blank"
              href={repo.url}
              className="mt-1 block break-all text-sm text-muted"
              aria-label={`${repo.owner}/${repo.name} on ${repo.host} (new tab)`}
            >
              {repo.url}
            </a>

            <dl className="mt-3.5 flex flex-wrap gap-x-6 gap-y-1 text-[13.5px] text-muted">
              <div>
                <dt className="inline">Stars: </dt>
                <dd className="inline font-medium text-ink">{compactStars(repo.stars, false)}</dd>
              </div>
              <div>
                <dt className="inline">Default branch: </dt>
                <dd className="inline font-medium text-ink">{repo.default_branch ?? "—"}</dd>
              </div>
              <div>
                <dt className="inline">Last scored: </dt>
                <dd className="inline font-medium text-ink">
                  {repo.last_scored_at ? relativeTime(repo.last_scored_at) : "—"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="min-w-[110px] shrink-0 text-left sm:text-center">
            <div
              role="img"
              aria-label={`Overall score ${overall.toFixed(1)} out of 100`}
              className={`text-[36px] font-bold leading-none tracking-tight tabular-nums sm:text-[42px] ${TIER_TEXT_CLASS[overallTier]}`}
            >
              {overall.toFixed(1)}
            </div>
            <div className="mt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Overall</div>
          </div>
        </div>
      </Panel>

      {/* Strengths + Gaps — two separate cards, aligned */}
      <div className="mt-3.5 grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2">
        <StrengthsCard items={strengths} empty={{ chip: "bad", text: "No fully-passing signals yet." }} />
        <GapsCard items={gaps} empty={{ chip: "ok", text: "No missing signals — nice." }} />
      </div>

      {/* Suggestions */}
      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Suggestions to improve for a specific model</PanelHeading>

          <ModelPills
            scroll={false}
            selected={selected}
            hrefFor={(m) => `/repo/${id}?model=${m}`}
            label="Select a model for per-model suggestions"
          />

          {suggestions.length === 0 ? (
            <div className="text-muted">
              No gaps — this repo is already maxing out {MODEL_BY_ID[selected].label}&apos;s rubric.
            </div>
          ) : (
            <ol className="m-0 list-none p-0">
              {suggestions.map((s, i) => (
                <SuggestionItem key={s.signalId} suggestion={s} index={i} />
              ))}
            </ol>
          )}
        </Panel>
      </div>

      {/* Per-model scores */}
      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Per-model scores</PanelHeading>

          <div className="grid grid-cols-1 gap-2.5">
            {MODELS.map((m) => {
              const ms = modelScores.find((x) => x.modelId === m.id);
              const s = ms?.score ?? 0;

              return (
                <div
                  key={m.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-line py-3 last:border-b-0 sm:grid-cols-[150px_1fr_auto] sm:gap-4"
                >
                  <div className="text-[15px] font-medium">{m.label}</div>
                  <div className="col-span-2 order-3 sm:col-span-1 sm:order-none">
                    <ScoreBar score={s} width={100} />
                    <div className="mt-1 text-sm text-muted">{m.rationale}</div>
                  </div>

                  <ScoreNumber score={s} />
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      {/* Full signal breakdown */}
      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Signal breakdown</PanelHeading>
          {signals.map((s) => (
            <SignalRow key={s.id} signal={s} />
          ))}
        </Panel>
      </div>
    </>
  );
}
