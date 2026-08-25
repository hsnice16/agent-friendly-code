import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AlternativesStrip } from "@/components/AlternativesStrip";
import { ModelSuggestions } from "@/components/ModelSuggestions";
import { Panel, PanelHeading } from "@/components/Panel";
import { PerModelScores } from "@/components/PerModelScores";
import { RecordScore } from "@/components/RecordScore";
import { RepoHero } from "@/components/RepoHero";
import { SignalListCard } from "@/components/SignalListCard";
import { SignalRow } from "@/components/SignalRow";
import { type ParsedRepo, parseRepoUrl } from "@/lib/clients/github";
import { HOST_DOMAINS, isHost } from "@/lib/constants/hosts";
import { ALTERNATIVES_LIMIT, STRENGTHS_GAPS_VISIBLE_LIMIT } from "@/lib/constants/scoring";
import { getAlternativesFor, getRepoByHostOwnerName } from "@/lib/db";
import { TooLargeError } from "@/lib/live-score/hosts";
import { liveScore } from "@/lib/live-score/score";
import { SUPPORTED_HOSTS } from "@/lib/live-score/supported";
import { topImprovements } from "@/lib/scoring/scorer";
import { MODEL_BY_ID, type ModelId } from "@/lib/scoring/weights";
import type { RepoRow } from "@/lib/types/db";
import { hostLabel } from "@/lib/utils/format";
import { OG_DEFAULTS, TWITTER_DEFAULTS } from "@/lib/version";

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
// failure from being pinned here for the hour.
function cachedLiveScore(parsed: ParsedRepo) {
  return unstable_cache(() => liveScore(parsed), ["live-score", parsed.host, parsed.owner, parsed.name], {
    revalidate: CACHE_SECONDS,
  })();
}

// Every miss here is a tree-API call and a cold function, and the route is
// crawler-reachable regardless of robots.txt. GitHub, GitLab and Bitbucket all
// restrict slugs to this alphabet, so anything else is a probe.
const SLUG = /^[A-Za-z0-9._-]+$/;

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { host, owner, name } = await params;
  const title = `${owner}/${name} — Live Score`;

  return {
    title,
    description: `On-demand agent-friendliness score for ${owner}/${name}, computed from its current commit.`,
    twitter: { ...TWITTER_DEFAULTS, title },
    alternates: { canonical: `/score/${host}/${owner}/${name}` },
    // Unbounded URL space; robots.ts disallows /score/* and the sitemap stays on /repo/:id.
    robots: { index: false, follow: true },
    openGraph: { ...OG_DEFAULTS, title, url: `/score/${host}/${owner}/${name}`, type: "website" },
  };
}

function Unsupported({ host }: { host: string }) {
  const label = hostLabel(host);

  return (
    <Panel>
      <h1 className="m-0 text-[19px] font-semibold tracking-tight">{label} support is coming</h1>
      <p className="mt-2 max-w-[64ch] text-[14.5px] text-ink-dim">
        {`Scoring works for ${label} repositories, but its API needs guards this page doesn't have yet — a wrong score would be worse than none. GitHub repositories work today.`}
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
  searchParams: Promise<{ model?: string }>;
}) {
  const { host, owner, name } = await params;
  const { model } = await searchParams;

  if (!isHost(host) || !SLUG.test(owner) || !SLUG.test(name)) notFound();

  const parsed = parseRepoUrl(`https://${HOST_DOMAINS[host]}/${owner}/${name}`);
  if (!parsed || parsed.host !== host) notFound();

  // Indexed repos get the canonical page: better SEO, and it absorbs the popular
  // repos that are also the most expensive to score cold.
  const indexed = getRepoByHostOwnerName(host, owner, name);
  if (indexed) redirect(`/repo/${indexed.id}`);

  if (!SUPPORTED_HOSTS.includes(parsed.host)) return <Unsupported host={host} />;

  let score: Awaited<ReturnType<typeof liveScore>>;
  try {
    score = await cachedLiveScore(parsed);
  } catch (err) {
    if (err instanceof TooLargeError) {
      return (
        <Unavailable reason="This repository is too large to score on demand. It can still be scored locally with the agent skill." />
      );
    }
    // Everything else is transient — a rate limit, a host blip. Let it reach
    // error.tsx rather than rendering an apology: a throw is never cached, so
    // the failure isn't served to everyone else for the next hour. Too-large is
    // the exception above; it is stable, so rendering (and caching) it is right.
    throw err;
  }

  if (!score) {
    return <Unavailable reason="No such public repository on that host — check the owner and name." />;
  }

  const selected: ModelId = model && model in MODEL_BY_ID ? (model as ModelId) : "claude-code";
  const suggestions = topImprovements(selected, score.signals);
  const strengths = score.signals.filter((s) => s.pass >= 1).slice(0, STRENGTHS_GAPS_VISIBLE_LIMIT);
  const gaps = score.signals.filter((s) => s.pass === 0).slice(0, STRENGTHS_GAPS_VISIBLE_LIMIT);
  const alternatives = getAlternativesFor(host, score.language, selected, ALTERNATIVES_LIMIT);

  const repo: RepoRow = {
    id: -1,
    host,
    name,
    owner,
    url: parsed.canonicalUrl,
    stars: score.stars,
    language: score.language,
    last_scored_at: null,
    overall_score: score.overall,
    previous_overall_score: null,
    default_branch: score.defaultBranch,
    badge_embedded: score.badgeEmbedded ? 1 : 0,
  };

  return (
    <>
      <Link
        href="/score"
        className="my-5 inline-flex items-center gap-1.5 text-sm text-muted no-underline hover:text-ink hover:no-underline"
      >
        ← score another repo
      </Link>

      <RecordScore host={host} owner={owner} name={name} score={score.overall} />

      <RepoHero repo={repo} commitSha={score.sha} />

      <div className="mt-3.5 grid grid-cols-1 items-stretch gap-3.5 md:grid-cols-2">
        <SignalListCard
          items={strengths}
          variant="strength"
          empty={{ chip: "bad", text: "No fully-passing signals yet." }}
        />
        <SignalListCard items={gaps} variant="gap" empty={{ chip: "ok", text: "No missing signals — nice." }} />
      </div>

      <div className="mt-3.5">
        <ModelSuggestions selected={selected} suggestions={suggestions} basePath={`/score/${host}/${owner}/${name}`} />
      </div>

      <div className="mt-3.5">
        <PerModelScores modelScores={score.modelScores} />
      </div>

      <div className="mt-3.5">
        <AlternativesStrip
          language={score.language}
          alternatives={alternatives}
          selectedModelLabel={MODEL_BY_ID[selected].label}
        />
      </div>

      <div className="mt-3.5">
        <Panel>
          <PanelHeading>Signal breakdown</PanelHeading>
          {score.signals.map((s) => (
            <SignalRow key={s.id} signal={s} />
          ))}
        </Panel>
      </div>
    </>
  );
}
