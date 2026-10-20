import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { ActionEmbed } from "@/components/ActionEmbed";
import { ActionEmbedReveal } from "@/components/ActionEmbedReveal";
import { AgentInstructions } from "@/components/AgentInstructions";
import { AlternativesStrip } from "@/components/AlternativesStrip";
import { HashDetails } from "@/components/HashDetails";
import { ModelSuggestions } from "@/components/ModelSuggestions";
import { Panel } from "@/components/Panel";
import { PerModelScores } from "@/components/PerModelScores";
import { RecordScore } from "@/components/RecordScore";
import { RepoHero } from "@/components/RepoHero";
import { Section, SectionRail } from "@/components/RepoSections";
import { RepoSummary } from "@/components/RepoSummary";
import type { NavSection } from "@/components/SectionNav";
import { SignalListCard } from "@/components/SignalListCard";
import { SignalRow } from "@/components/SignalRow";
import { type ParsedRepo, parseRepoUrl } from "@/lib/clients/github";
import { HOST_DOMAINS, isHost } from "@/lib/constants/hosts";
import { ALTERNATIVES_LIMIT, STRENGTHS_GAPS_VISIBLE_LIMIT } from "@/lib/constants/scoring";
import { getRepoByHostOwnerName, listLeaderboardOverall } from "@/lib/db";
import { TooLargeError } from "@/lib/live-score/hosts";
import { liveScore } from "@/lib/live-score/score";
import { SUPPORTED_HOSTS } from "@/lib/live-score/supported";
import { topImprovements } from "@/lib/scoring/scorer";
import type { ModelId } from "@/lib/scoring/weights";
import type { RepoRow } from "@/lib/types/db";
import { agentInstructions } from "@/lib/utils/agent-instructions";
import { hostLabel } from "@/lib/utils/format";
import { isModelId } from "@/lib/utils/leaderboard-href";
import { sanitizeDescription, sanitizeTopics, topicsColumn } from "@/lib/utils/repo-about";
import { agentFileShare } from "@/lib/utils/repo-page-data";
import { repoPath, withQuery } from "@/lib/utils/repo-path";
import { summarizeScore } from "@/lib/utils/repo-summary";
import { similarNote, similarRepos } from "@/lib/utils/similar-repos";
import { ACTION_USES, DEFAULT_OG_IMAGE, OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

// Hobby defaults to 10s; a large tree needs more.
export const maxDuration = 60;

const CACHE_SECONDS = 3600;

type Params = { host: string; owner: string; name: string };

// Reading `searchParams` for `?model=` makes this route dynamic, so a
// segment-level `revalidate` would never cache the render — every visit would
// re-list the tree and re-score. Cache the expensive half explicitly instead,
// keyed by repo and not by model: the score is the same for all of them, and
// the result is deterministic given (commit, weights), so an hour of staleness
// costs nothing. A throw is not cached, which is what keeps a transient host
// failure from being pinned here for the hour. Lowercased because every host
// matches names case-insensitively: one repo, one entry, one scoring.
function cachedLiveScore(parsed: ParsedRepo) {
  const key = ["live-score", parsed.host, parsed.owner.toLowerCase(), parsed.name.toLowerCase()];
  return unstable_cache(() => liveScore(parsed), key, { revalidate: CACHE_SECONDS })();
}

// Every miss here is a tree-API call and a cold function, and the route is
// crawler-reachable regardless of robots.txt. GitHub, GitLab and Bitbucket all
// restrict slugs to this alphabet, so anything else is a probe. `.` and `..`
// fit it but would walk the API path upwards.
const SLUG = /^(?!\.+$)[A-Za-z0-9._-]+$/;

function parseTarget({ host, owner, name }: Params): ParsedRepo | null {
  if (!isHost(host) || !SLUG.test(owner) || !SLUG.test(name)) return null;
  const parsed = parseRepoUrl(`https://${HOST_DOMAINS[host]}/${owner}/${name}`);
  return parsed && parsed.host === host ? parsed : null;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const target = await params;
  if (!parseTarget(target)) return {};
  const { host, owner, name } = target;
  const title = `${owner}/${name} — Live Score`;
  const description = `How ready ${owner}/${name} is for AI coding agents, scored from its latest commit.`;

  return {
    title,
    description,
    twitter: { ...TWITTER_DEFAULTS, images: [DEFAULT_OG_IMAGE], title, description },
    alternates: { canonical: `/score/${host}/${owner}/${name}` },
    // Unbounded URL space; robots.ts disallows /score/* and the sitemap stays on the repo pages.
    robots: { index: false, follow: true },
    openGraph: {
      ...OG_DEFAULTS,
      images: [DEFAULT_OG_IMAGE],
      title,
      description,
      url: `/score/${host}/${owner}/${name}`,
      type: "website",
    },
  };
}

function Unsupported({ host }: { host: string }) {
  const label = hostLabel(host);

  return (
    <Panel>
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

function Unavailable({ reason }: { reason: string }) {
  return (
    <Panel>
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

  const parsed = parseTarget({ host, owner, name });
  if (!parsed) notFound();

  // Indexed repos get the canonical page: better SEO, and it absorbs the popular
  // repos that are also the most expensive to score cold.
  const indexed = getRepoByHostOwnerName(host, owner, name);
  if (indexed) permanentRedirect(withQuery(repoPath(indexed), query));

  if (!SUPPORTED_HOSTS.includes(parsed.host)) return <Unsupported host={host} />;

  let score: Awaited<ReturnType<typeof liveScore>>;
  try {
    score = await cachedLiveScore(parsed);
  } catch (err) {
    if (err instanceof TooLargeError) {
      return (
        <Unavailable reason="This repo is too big to score here. Score it on your own computer with the agent skill." />
      );
    }
    // Everything else is transient — a rate limit, a host blip. Let it reach
    // error.tsx rather than rendering an apology: a throw is never cached, so
    // the failure isn't served to everyone else for the next hour. Too-large is
    // the exception above; it is stable, so rendering (and caching) it is right.
    throw err;
  }

  if (!score) {
    return <Unavailable reason="We couldn't find a public repo with that name. Check the owner and repo name." />;
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
  // The repo page's order, less what needs a leaderboard row: "How it
  // compares" ranks against the board, and the badge reads the database.
  const sections: NavSection[] = [
    { id: "overview", label: "At a glance" },
    { id: "has-missing", label: "What it has and misses" },
    { id: "fix-first", label: "What to fix first" },
    { id: "agent-scores", label: "Score for each agent" },
    instructions && { id: "agent-instructions", label: "Agent instructions" },
    { id: "all-checks", label: "All checks" },
    { id: "similar", label: "Similar repos" },
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
          <ModelSuggestions
            selected={selected}
            suggestions={suggestions}
            basePath={`/score/${host}/${owner}/${name}`}
          />
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

        {host === "github" && (
          <Section id="pr-action">
            <ActionEmbedReveal>
              <ActionEmbed actionUses={ACTION_USES} branch={score.defaultBranch} showSecretLink highlight="info" />
            </ActionEmbedReveal>
          </Section>
        )}

        <SectionRail sections={sections} />
      </div>
    </>
  );
}
