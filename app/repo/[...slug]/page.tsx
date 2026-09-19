import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";

import { ActionEmbed } from "@/components/ActionEmbed";
import { AlternativesStrip } from "@/components/AlternativesStrip";
import { BadgeEmbed } from "@/components/BadgeEmbed";
import { ModelSuggestions } from "@/components/ModelSuggestions";
import { Panel, PanelHeading } from "@/components/Panel";
import { PerModelScores } from "@/components/PerModelScores";
import { RepoHero } from "@/components/RepoHero";
import { SignalListCard } from "@/components/SignalListCard";
import { SignalRow } from "@/components/SignalRow";

import { ALTERNATIVES_LIMIT, STRENGTHS_GAPS_VISIBLE_LIMIT } from "@/lib/constants/scoring";
import { getAlternatives, getModelScores, getRepoByHostOwnerName, getSignalResults } from "@/lib/db";
import { topImprovements } from "@/lib/scoring/scorer";
import { MODEL_BY_ID, MODELS, type ModelId } from "@/lib/scoring/weights";
import { repoIdentity, repoPath } from "@/lib/utils/repo-path";
import { ACTION_USES, APP_KEYWORDS, APP_URL, OG_DEFAULTS, OG_IMAGE_SIZE, TWITTER_DEFAULTS } from "@/lib/version";

type Params = { slug: string[] };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const identity = repoIdentity((await params).slug);
  if (!identity) {
    return {};
  }

  const repo = getRepoByHostOwnerName(identity.host, identity.owner, identity.name);
  if (!repo) {
    return {};
  }

  const path = repoPath(repo);
  const slug = `${repo.owner}/${repo.name}`;
  const image = { url: `/og${path}`, ...OG_IMAGE_SIZE, alt: `${slug} — agent-friendliness score` };

  const score = repo.overall_score != null ? repo.overall_score.toFixed(1) : "unranked";

  const title = `${slug} — ${score} / 100`;
  const description = `Agent-friendliness score for ${slug} across Claude Code, Cursor, Devin, GPT-5 Codex, Gemini CLI, Kimi CLI, Aider, OpenHands, and Pi — with the top improvements ranked by score-gain.`;

  const repoKeywords = [
    slug,
    repo.name,
    repo.owner,
    repo.language,
    `${repo.name} ai agent`,
    `${repo.name} agents.md`,
    `${repo.name} ai coding agent`,
    ...MODELS.map((m) => `${repo.name} ${m.label.toLowerCase()}`),
    ...MODELS.map((m) => m.label),
    ...APP_KEYWORDS,
  ].filter((k): k is string => Boolean(k));

  return {
    title,
    description,
    keywords: repoKeywords,
    alternates: { canonical: path },
    twitter: { ...TWITTER_DEFAULTS, title, description, images: [image] },
    openGraph: { ...OG_DEFAULTS, title, description, url: path, type: "article", images: [image] },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ model?: string }>;
}) {
  const identity = repoIdentity((await params).slug);
  const { model } = await searchParams;

  if (!identity) {
    notFound();
  }

  const repo = getRepoByHostOwnerName(identity.host, identity.owner, identity.name);
  if (!repo) {
    notFound();
  }

  const id = repo.id;
  const path = repoPath(repo);

  // The lookup ignores case, so one repo answers to several spellings. Serve
  // the stored one and redirect the rest, rather than duplicating the page.
  if (identity.host !== repo.host || identity.owner !== repo.owner || identity.name !== repo.name) {
    permanentRedirect(path);
  }

  const selected: ModelId = model && model in MODEL_BY_ID ? (model as ModelId) : "claude-code";

  const signals = getSignalResults(id);
  const modelScores = getModelScores(id);
  const alternatives = getAlternatives(id, selected, ALTERNATIVES_LIMIT);

  const suggestions = topImprovements(selected, signals);
  const strengths = signals.filter((s) => s.pass >= 1).slice(0, STRENGTHS_GAPS_VISIBLE_LIMIT);

  const gaps = signals.filter((s) => s.pass === 0).slice(0, STRENGTHS_GAPS_VISIBLE_LIMIT);

  const slug = `${repo.owner}/${repo.name}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            item: `${APP_URL}/`,
            name: "Leaderboard",
          },
          {
            "@type": "ListItem",
            name: slug,
            position: 2,
            item: `${APP_URL}${path}`,
          },
        ],
      },
      {
        "@type": "SoftwareSourceCode",
        name: slug,
        codeRepository: repo.url,
        url: `${APP_URL}${path}`,
        ...(repo.language ? { programmingLanguage: repo.language } : {}),
        ...(repo.last_scored_at != null ? { dateModified: new Date(repo.last_scored_at * 1000).toISOString() } : {}),
        keywords: [slug, repo.name, repo.owner, repo.language, "AGENTS.md", "AI coding agent"]
          .filter(Boolean)
          .join(", "),
        description: `Agent-friendliness score for ${slug} across Claude Code, Cursor, Devin, GPT-5 Codex, Gemini CLI, Kimi CLI, Aider, OpenHands, and Pi.`,
        additionalProperty: signals.map((s) => ({
          "@type": "PropertyValue",
          name: s.label,
          value: s.pass,
          ...(s.detail ? { description: s.detail } : {}),
        })),
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

      <aside
        aria-label="Tools you can add to this repo"
        className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-warn/40 bg-surface px-4 py-2.5 text-[12.5px]"
      >
        <span className="text-warn">Use on your repo:</span>
        <a href="#embed-badge" className="text-ink-dim underline-offset-4 hover:text-ink-soft hover:underline">
          Embed a badge ↓
        </a>
        <span aria-hidden="true" className="text-line">
          ·
        </span>
        <a href="#pr-action" className="text-ink-dim underline-offset-4 hover:text-ink-soft hover:underline">
          Add the PR-diff Action ↓
        </a>
        <span aria-hidden="true" className="text-line">
          ·
        </span>
        <Link href="/skill" className="text-ink-dim underline-offset-4 hover:text-ink-soft hover:underline">
          Install the agent skill →
        </Link>
      </aside>

      <div className="mt-3.5 grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2">
        <SignalListCard
          items={strengths}
          variant="strength"
          empty={{ chip: "bad", text: "No fully-passing signals yet." }}
        />
        <SignalListCard items={gaps} variant="gap" empty={{ chip: "ok", text: "No missing signals — nice." }} />
      </div>

      <div className="mt-3.5">
        <ModelSuggestions basePath={path} selected={selected} suggestions={suggestions} />
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

      <div id="embed-badge" className="mt-3.5 scroll-mt-20">
        <BadgeEmbed
          highlight="tip"
          appUrl={APP_URL}
          name={repo.name}
          host={repo.host}
          owner={repo.owner}
          repoPagePath={path}
        />
      </div>

      <div id="pr-action" className="mt-3.5 scroll-mt-20">
        <ActionEmbed actionUses={ACTION_USES} showSecretLink highlight="info" />
      </div>
    </>
  );
}
