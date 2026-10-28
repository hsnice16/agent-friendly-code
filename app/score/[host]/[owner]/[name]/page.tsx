import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ActionEmbed } from "@/components/ActionEmbed";
import { ActionEmbedReveal } from "@/components/ActionEmbedReveal";
import { AgentInstructions } from "@/components/AgentInstructions";
import { AlternativesStrip } from "@/components/AlternativesStrip";
import { BadgeEmbed } from "@/components/BadgeEmbed";
import { HashDetails } from "@/components/HashDetails";
import { ModelSuggestions } from "@/components/ModelSuggestions";
import { Panel } from "@/components/Panel";
import { PerModelScores } from "@/components/PerModelScores";
import { RecordScore } from "@/components/RecordScore";
import { RepoHero } from "@/components/RepoHero";
import { Section, SectionRail } from "@/components/RepoSections";
import { RepoSummary } from "@/components/RepoSummary";
import type { NavSection } from "@/components/SectionNav";
import { ShareScore } from "@/components/ShareScore";
import { SignalListCard } from "@/components/SignalListCard";
import { SignalRow } from "@/components/SignalRow";
import { TrackEvent } from "@/components/TrackEvent";
import { ALTERNATIVES_LIMIT, STRENGTHS_GAPS_VISIBLE_LIMIT } from "@/lib/constants/scoring";
import { getRepoByHostOwnerName, listLeaderboardOverall } from "@/lib/db";
import { cachedLiveScore, type LiveTarget, parseLiveTarget } from "@/lib/live-score/cached";
import { TooLargeError } from "@/lib/live-score/hosts";
import { SUPPORTED_HOSTS } from "@/lib/live-score/supported";
import { topImprovements } from "@/lib/scoring/scorer";
import type { ModelId } from "@/lib/scoring/weights";
import type { RepoRow } from "@/lib/types/db";
import { agentInstructions } from "@/lib/utils/agent-instructions";
import { hostLabel } from "@/lib/utils/format";
import { isModelId } from "@/lib/utils/leaderboard-href";
import { sanitizeDescription, sanitizeTopics, topicsColumn } from "@/lib/utils/repo-about";
import { agentFileShare } from "@/lib/utils/repo-page-data";
import { liveScorePath, repoPath, withQuery } from "@/lib/utils/repo-path";
import { summarizeScore } from "@/lib/utils/repo-summary";
import { scoreTier } from "@/lib/utils/score";
import { similarNote, similarRepos } from "@/lib/utils/similar-repos";
import { ACTION_USES, APP_URL, DEFAULT_OG_IMAGE, OG_DEFAULTS, OG_IMAGE_SIZE, TWITTER_DEFAULTS } from "@/lib/version";

// lib/live-score/score.ts and http.ts time out inside this cap.
export const maxDuration = 60;

type Params = LiveTarget;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const target = await params;
  const parsed = parseLiveTarget(target);
  if (!parsed) return {};
  const { host, owner, name } = target;
  const title = `${owner}/${name} — Live Score`;
  const description = `How ready ${owner}/${name} is for AI coding agents, scored from its latest commit.`;
  const path = liveScorePath({ host, owner, name });
  // The card 404s for a host outside SUPPORTED_HOSTS.
  const image = SUPPORTED_HOSTS.includes(parsed.host)
    ? { url: `/og${path}`, ...OG_IMAGE_SIZE, alt: `${owner}/${name} — agent-friendliness score` }
    : DEFAULT_OG_IMAGE;

  return {
    title,
    description,
    twitter: { ...TWITTER_DEFAULTS, images: [image], title, description },
    alternates: { canonical: path },
    // Unbounded URL space: robots.ts disallows /score/* for search crawlers and the sitemap stays on the repo pages.
    robots: { index: false, follow: true },
    openGraph: {
      ...OG_DEFAULTS,
      images: [image],
      title,
      description,
      url: path,
      type: "website",
    },
  };
}

function Unsupported({ host }: { host: string }) {
  const label = hostLabel(host);

  return (
    <Panel>
      <TrackEvent event={{ name: "live_score_result", outcome: "unsupported" }} />
      <h1 className="m-0 text-[19px] font-semibold tracking-tight">{label} support is coming</h1>
      <p className="mt-2 max-w-[64ch] text-[14.5px] text-ink-dim">
        {`This page can't yet stay within ${label}'s API limits, and a wrong score is worse than none. GitHub repos work today.`}
      </p>
      <Link href="/score" className="mt-3.5 inline-block text-[14px] text-ink-dim hover:text-ink">
        ← try a GitHub repo
      </Link>
    </Panel>
  );
}

function Unavailable({ reason, outcome }: { reason: string; outcome: "not_found" | "too_large" }) {
  return (
    <Panel>
      <TrackEvent event={{ name: "live_score_result", outcome }} />
      <h1 className="m-0 text-[19px] font-semibold tracking-tight">Couldn&apos;t score this repo</h1>
      <p className="mt-2 max-w-[64ch] text-[14.5px] text-ink-dim">{reason}</p>
      <Link href="/score" className="mt-3.5 inline-block text-[14px] text-ink-dim hover:text-ink">
        ← try another repo
      </Link>
    </Panel>
  );
}

export default async function LiveScorePage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { host, owner, name } = await params;
  const query = await searchParams;
  const model = typeof query.model === "string" ? query.model : undefined;

  const parsed = parseLiveTarget({ host, owner, name });
  if (!parsed) notFound();

  // Indexed repos get the canonical page: better SEO, and it absorbs the popular
  // repos that are also the most expensive to score cold.
  const indexed = getRepoByHostOwnerName(host, owner, name);
  if (indexed) permanentRedirect(withQuery(repoPath(indexed), query));

  if (!SUPPORTED_HOSTS.includes(parsed.host)) return <Unsupported host={host} />;

  let score: Awaited<ReturnType<typeof cachedLiveScore>>;
  try {
    score = await cachedLiveScore(parsed);
  } catch (err) {
    if (err instanceof TooLargeError) {
      return (
        <Unavailable
          outcome="too_large"
          reason="This repo is too big to score here. Score it on your own computer with the agent skill."
        />
      );
    }
    // Everything else is transient — a rate limit, a host blip — so error.tsx offers a retry.
    throw err;
  }

  if (!score) {
    return (
      <Unavailable
        outcome="not_found"
        reason="We couldn't find a public repo with that name. Check the owner and repo name."
      />
    );
  }

  const selected: ModelId = isModelId(model) ? model : "claude-code";
  const suggestions = topImprovements(selected, score.signals);
  const strengths = score.signals.filter((s) => s.pass >= 1).slice(0, STRENGTHS_GAPS_VISIBLE_LIMIT);
  const gaps = score.signals.filter((s) => s.pass === 0).slice(0, STRENGTHS_GAPS_VISIBLE_LIMIT);

  const repo: RepoRow = {
    id: -1,
    host,
    name,
    owner,
    url: parsed.canonicalUrl,
    stars: score.stars,
    language: score.language,
    last_scored_at: null,
    content_changed_at: null,
    overall_score: score.overall,
    previous_overall_score: null,
    default_branch: score.defaultBranch,
    badge_embedded: score.badgeEmbedded ? 1 : 0,
    // Re-sanitised: an hour-cached result may predate these fields or their rules.
    description: sanitizeDescription(score.description),
    topics: topicsColumn(sanitizeTopics(score.topics)),
  };
  const alternatives = similarRepos({ ...repo, score: score.overall }, listLeaderboardOverall(), ALTERNATIVES_LIMIT);

  const instructions = agentInstructions(score.signals, agentFileShare(score.language));
  const slug = `${owner}/${name}`;
  const path = liveScorePath({ host, owner, name });
  // The repo page's order, less "How it compares", which ranks against the board.
  const sections: NavSection[] = [
    { id: "overview", label: "At a glance" },
    { id: "has-missing", label: "What it has and misses" },
    { id: "fix-first", label: "What to fix first" },
    { id: "agent-scores", label: "Score for each agent" },
    instructions && { id: "agent-instructions", label: "Agent instructions" },
    { id: "all-checks", label: "All checks" },
    { id: "similar", label: "Similar repos" },
    { id: "embed-badge", label: "Add a badge" },
    host === "github" && { id: "pr-action", label: "Check every PR" },
  ].filter((x): x is NavSection => Boolean(x));

  return (
    <>
      <Link
        href="/score"
        className="my-5 inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink hover:no-underline"
      >
        ← score another repo
      </Link>

      <RecordScore host={host} owner={owner} name={name} score={score.overall} />
      <TrackEvent event={{ name: "live_score_result", outcome: "scored", tier: scoreTier(score.overall) }} />

      <div className="relative">
        <RepoHero repo={repo} commitSha={score.sha} />

        <Section id="overview">
          <RepoSummary summary={summarizeScore(score.modelScores, score.signals)} />
        </Section>

        <Section id="has-missing" className="grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2">
          <SignalListCard
            items={strengths}
            variant="strength"
            empty={{ chip: "bad", text: "Nothing passes fully yet." }}
          />
          <SignalListCard items={gaps} variant="gap" empty={{ chip: "ok", text: "Nothing missing." }} />
        </Section>

        <Section id="fix-first">
          <ModelSuggestions selected={selected} suggestions={suggestions} basePath={path} />
        </Section>

        <Section id="agent-scores">
          <PerModelScores modelScores={score.modelScores} signals={score.signals} />
        </Section>

        {instructions && (
          <Section id="agent-instructions">
            <AgentInstructions data={instructions} slug={slug} repo={repo} />
          </Section>
        )}

        <Section id="all-checks">
          <HashDetails
            id="all-checks"
            summary={
              <h2 className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
                All {score.signals.length} checks · {score.signals.filter((s) => s.pass >= 1).length} passed
              </h2>
            }
          >
            {score.signals.map((s) => (
              <SignalRow key={s.id} signal={s} repo={repo} />
            ))}
          </HashDetails>
        </Section>

        <Section id="similar">
          <AlternativesStrip
            language={score.language}
            alternatives={alternatives}
            note={similarNote(repo, alternatives)}
          />
        </Section>

        <Section id="embed-badge">
          <BadgeEmbed
            highlight="tip"
            appUrl={APP_URL}
            name={name}
            host={host}
            owner={owner}
            repoPagePath={path}
            score={score.overall}
            page="live_score"
          />
        </Section>

        {host === "github" && (
          <Section id="pr-action">
            <ActionEmbedReveal>
              <ActionEmbed actionUses={ACTION_USES} branch={score.defaultBranch} showSecretLink highlight="info" />
            </ActionEmbedReveal>
          </Section>
        )}

        <SectionRail
          sections={sections}
          action={(align) => <ShareScore slug={slug} score={score.overall} url={`${APP_URL}${path}`} align={align} />}
        />
      </div>
    </>
  );
}
