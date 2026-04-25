import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AlternativesStrip } from "@/components/AlternativesStrip";
import { BadgeEmbed } from "@/components/BadgeEmbed";
import { ModelSuggestions } from "@/components/ModelSuggestions";
import { Panel, PanelHeading } from "@/components/Panel";
import { PerModelScores } from "@/components/PerModelScores";
import { RepoHero } from "@/components/RepoHero";
import { SignalListCard } from "@/components/SignalListCard";
import { SignalRow } from "@/components/SignalRow";

import { STRENGTHS_GAPS_VISIBLE_LIMIT } from "@/lib/constants/scoring";
import { getAlternatives, getModelScores, getRepo, getSignalResults } from "@/lib/db";
import { topImprovements } from "@/lib/scoring/scorer";
import { MODEL_BY_ID, type ModelId } from "@/lib/scoring/weights";
import { APP_URL } from "@/lib/version";

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
  const alternatives = getAlternatives(id, selected, 3);

  const suggestions = topImprovements(selected, signals, 3);
  const strengths = signals.filter((s) => s.pass >= 1).slice(0, STRENGTHS_GAPS_VISIBLE_LIMIT);

  const gaps = signals.filter((s) => s.pass === 0).slice(0, STRENGTHS_GAPS_VISIBLE_LIMIT);

  const slug = `${repo.owner}/${repo.name}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Leaderboard",
        item: `${APP_URL}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: slug,
        item: `${APP_URL}/repo/${id}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw script content; payload is server-controlled and `<` is escaped
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <Link
        href="/"
        className="my-5 inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink hover:no-underline"
      >
        ← back to leaderboard
      </Link>

      <RepoHero repo={repo} />

      <div className="mt-3.5 grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2">
        <SignalListCard
          items={strengths}
          variant="strength"
          empty={{ chip: "bad", text: "No fully-passing signals yet." }}
        />
        <SignalListCard items={gaps} variant="gap" empty={{ chip: "ok", text: "No missing signals — nice." }} />
      </div>

      <div className="mt-3.5">
        <ModelSuggestions repoId={id} selected={selected} suggestions={suggestions} />
      </div>

      <div className="mt-3.5">
        <PerModelScores modelScores={modelScores} />
      </div>

      <div className="mt-3.5">
        <AlternativesStrip
          language={repo.language}
          alternatives={alternatives}
          selectedModelLabel={MODEL_BY_ID[selected].label}
        />
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Signal breakdown</PanelHeading>
          {signals.map((s) => (
            <SignalRow key={s.id} signal={s} />
          ))}
        </Panel>
      </div>

      <div className="mt-3.5">
        <BadgeEmbed
          appUrl={APP_URL}
          name={repo.name}
          host={repo.host}
          owner={repo.owner}
          repoPagePath={`/repo/${id}`}
        />
      </div>
    </>
  );
}
