import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ActionEmbed } from "@/components/ActionEmbed";
import { ActionEmbedReveal } from "@/components/ActionEmbedReveal";
import { AgentInstructions } from "@/components/AgentInstructions";
import { AlternativesStrip } from "@/components/AlternativesStrip";
import { BadgeEmbed } from "@/components/BadgeEmbed";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { HashDetails } from "@/components/HashDetails";
import { JsonLd } from "@/components/JsonLd";
import { ModelSuggestionsSwitch } from "@/components/ModelSuggestionsSwitch";
import { PerModelScores } from "@/components/PerModelScores";
import { RepoHero } from "@/components/RepoHero";
import { RepoReport } from "@/components/RepoReport";
import { Section, SectionRail } from "@/components/RepoSections";
import { RepoSummary } from "@/components/RepoSummary";
import type { NavSection } from "@/components/SectionNav";
import { SignalListCard } from "@/components/SignalListCard";
import { SignalRow } from "@/components/SignalRow";

import { checkRates } from "@/lib/check-rates";
import { ALTERNATIVES_LIMIT, STRENGTHS_GAPS_VISIBLE_LIMIT } from "@/lib/constants/scoring";
import { getModelScores } from "@/lib/db";
import { topImprovements } from "@/lib/scoring/scorer";
import { MODELS } from "@/lib/scoring/weights";
import { getTopicGroups } from "@/lib/topic-pages";
import { reposSharingTopics, topicLabel, topicLinks } from "@/lib/topics";
import { agentInstructions } from "@/lib/utils/agent-instructions";
import { groupByLanguage, hubPath, isHub, languageSlug } from "@/lib/utils/language";
import {
  agentFileShare,
  boardRanks,
  loadAbout,
  loadBoard,
  loadRepo,
  loadSignals,
  loadSummary,
} from "@/lib/utils/repo-page-data";
import { repoJsonLd, repoMetadata } from "@/lib/utils/repo-page-meta";
import { repoIdentity, repoPath } from "@/lib/utils/repo-path";
import { buildRepoReport } from "@/lib/utils/repo-report";
import { similarNote, similarRepos } from "@/lib/utils/similar-repos";
import { ACTION_USES, APP_URL } from "@/lib/version";

type Params = { slug: string[] };

// Every repo is rendered at build: data/rank.db only changes with a deploy.
// Reading `searchParams` (`?model=`) would make every visit a fresh render.
export function generateStaticParams(): Params[] {
  return loadBoard().map((r) => ({ slug: [r.host, ...r.owner.split("/"), r.name] }));
}

// Other casings and former names fall through to app/repo-redirect/slug
// (see next.config.ts). Redirecting from here instead, the first visit came
// back as a 200 copy and later ones as a 308 without a Location.
export const dynamicParams = false;

async function load(params: Promise<Params>) {
  const identity = repoIdentity((await params).slug);
  return identity ? loadRepo(identity.host, identity.owner, identity.name) : null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const repo = await load(params);
  if (!repo) {
    return {};
  }

  return repoMetadata(repo, { signals: loadSignals(repo.id), summary: loadSummary(repo), about: loadAbout(repo) });
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const repo = await load(params);
  if (!repo) {
    notFound();
  }

  const id = repo.id;
  const path = repoPath(repo);

  const signals = loadSignals(id);
  const modelScores = getModelScores(id);
  const summary = loadSummary(repo);
  const about = loadAbout(repo);
  const board = loadBoard();
  const alternatives = similarRepos({ ...repo, score: repo.overall_score }, board, ALTERNATIVES_LIMIT);
  const byTopic = reposSharingTopics(
    { ...repo, score: repo.overall_score },
    board,
    new Set(alternatives.map((a) => a.id)),
    ALTERNATIVES_LIMIT,
  ).map(({ row, shared }) => ({
    ...row,
    detail: `${row.language ?? "—"} · ${shared.map(topicLabel).join(", ")}`,
  }));
  const report = summary
    ? buildRepoReport({ repo, summary, board, signals, rates: checkRates(signals, repo.language) })
    : null;
  const instructions = agentInstructions(signals, agentFileShare(repo.language));

  const slugOfLanguage = repo.language ? languageSlug(repo.language) : null;
  const hubs = groupByLanguage(board).filter(isHub);
  const hub = hubs.find((g) => g.slug === slugOfLanguage);
  const hubHref = hub ? hubPath(hub.slug) : undefined;
  const topicHrefs = topicLinks(
    about.topics,
    getTopicGroups(),
    hubs.map((g) => ({ slug: g.slug, href: hubPath(g.slug) })),
  );
  // The Action is a GitHub workflow; it cannot run on other hosts.
  const onGitHub = repo.host === "github";

  const agents = MODELS.map((m) => ({ id: m.id, label: m.label, suggestions: topImprovements(m.id, signals) }));
  const strengths = signals.filter((s) => s.pass >= 1).slice(0, STRENGTHS_GAPS_VISIBLE_LIMIT);

  const gaps = signals.filter((s) => s.pass === 0).slice(0, STRENGTHS_GAPS_VISIBLE_LIMIT);

  const slug = `${repo.owner}/${repo.name}`;
  // Page order: this repo's own results first, then how it sits among others,
  // then the tools to add to it.
  const sections: NavSection[] = [
    summary && { id: "overview", label: "At a glance" },
    { id: "has-missing", label: "What it has and misses" },
    { id: "fix-first", label: "What to fix first" },
    { id: "agent-scores", label: "Score for each agent" },
    instructions && { id: "agent-instructions", label: "Agent instructions" },
    { id: "all-checks", label: "All checks" },
    report && { id: "compare", label: "How it compares" },
    { id: "similar", label: "Similar repos" },
    byTopic.length > 0 && { id: "same-topics", label: "Same topics" },
    { id: "embed-badge", label: "Add a badge" },
    onGitHub && { id: "pr-action", label: "Check every PR" },
  ].filter((x): x is NavSection => Boolean(x));

  const jsonLd = repoJsonLd(repo, { signals, summary, about });

  return (
    <>
      <JsonLd data={jsonLd} />
      <Breadcrumbs
        parents={hub && hubHref ? [{ name: hub.label, path: hubHref }] : []}
        current={{ name: slug, path }}
      />

      {/* Starts at the hero so the rail's top lines up with the first card. */}
      <div className="relative">
        <RepoHero
          repo={repo}
          about={about}
          topicLinks={topicHrefs}
          language={hub && hubHref ? { label: hub.label, href: hubHref } : undefined}
        />

        {summary && (
          <Section id="overview">
            <RepoSummary summary={summary} />
          </Section>
        )}

        <Section id="has-missing" className="grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2">
          <SignalListCard
            items={strengths}
            variant="strength"
            empty={{ chip: "bad", text: "Nothing passes fully yet." }}
          />
          <SignalListCard items={gaps} variant="gap" empty={{ chip: "ok", text: "Nothing missing." }} />
        </Section>

        <Section id="fix-first">
          <ModelSuggestionsSwitch agents={agents} />
        </Section>

        <Section id="agent-scores">
          <PerModelScores modelScores={modelScores} signals={signals} ranks={boardRanks(id)} />
        </Section>

        {instructions && (
          <Section id="agent-instructions">
            <AgentInstructions data={instructions} slug={slug} repo={repo} />
          </Section>
        )}

        <Section id="all-checks">
          {/* Collapsed: "What it has and misses" already shows the headline checks. */}
          <HashDetails
            id="all-checks"
            summary={
              <h2 className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                All {signals.length} checks · {signals.filter((s) => s.pass >= 1).length} passed
              </h2>
            }
          >
            {signals.map((s) => (
              <SignalRow key={s.id} signal={s} repo={repo} />
            ))}
          </HashDetails>
        </Section>

        {report && (
          <Section id="compare">
            <RepoReport slug={slug} report={report} />
          </Section>
        )}

        <Section id="similar">
          <AlternativesStrip
            language={hub?.label ?? repo.language}
            hubHref={hubHref}
            alternatives={alternatives}
            note={similarNote(repo, alternatives)}
          />
        </Section>

        {byTopic.length > 0 && (
          <Section id="same-topics">
            <AlternativesStrip
              heading="Same topics, any language"
              language={repo.language}
              alternatives={byTopic}
              note="Repos tagged with the same GitHub topics, most shared first."
            />
          </Section>
        )}

        <Section id="embed-badge">
          <BadgeEmbed
            highlight="tip"
            appUrl={APP_URL}
            name={repo.name}
            host={repo.host}
            owner={repo.owner}
            repoPagePath={path}
            score={repo.overall_score}
          />
        </Section>

        {onGitHub && (
          <Section id="pr-action">
            <ActionEmbedReveal>
              <ActionEmbed actionUses={ACTION_USES} branch={repo.default_branch} showSecretLink highlight="info" />
            </ActionEmbedReveal>
          </Section>
        )}

        <SectionRail sections={sections} />
      </div>
    </>
  );
}
