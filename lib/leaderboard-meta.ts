import type { Metadata } from "next";

import { pageSlice } from "@/lib/board";
import { LEAD_MIN_STARS } from "@/lib/constants/scoring";
import type { LeaderboardView } from "@/lib/leaderboard-view";
import { MODEL_BY_ID } from "@/lib/scoring/weights";
import type { LeaderboardRow } from "@/lib/types/db";
import { boardPagePath } from "@/lib/utils/leaderboard-href";
import { fitDescription, pageTitle } from "@/lib/utils/page-title";
import { APP_NAME, DEFAULT_OG_IMAGE, OG_DEFAULTS, OG_IMAGE_SIZE, TWITTER_DEFAULTS } from "@/lib/version";

const HOME_TITLE = `${APP_NAME} — is your codebase ready for AI agents?`;

export const HOSTS_TEXT = "GitHub, GitLab and Bitbucket";

// Worded for the searches that reach these boards: "best github repos for
// claude code", "cursor leaderboard". Kept to what fits 60 characters with the
// longest label, Kimi Code CLI, so no board falls back to a different wording.
export function modelBoardTitle(label: string): string {
  return `Best GitHub repos for ${label}: ranked leaderboard`;
}

export function meetsLeadFloor(r: Pick<LeaderboardRow, "stars">): boolean {
  return (r.stars ?? 0) >= LEAD_MIN_STARS;
}

/** `rows` in rank order. */
export function boardLeader<T extends Pick<LeaderboardRow, "stars">>(rows: T[]): T | undefined {
  return rows.find(meetsLeadFloor);
}

/** The 1-based ranks a board page shows. */
export function pageRanks({ page, allRows }: Pick<LeaderboardView, "page" | "allRows">): {
  first: number;
  last: number;
} {
  const { startIdx, endIdx } = pageSlice(allRows.length, page);
  return { first: startIdx + 1, last: endIdx };
}

// Terse so a board's meta description still has room for it after the longest first sentences (Claude Code's).
export const LEADER_QUALIFIER = `Best with ${LEAD_MIN_STARS}+ stars`;

/** The one sentence copy uses to name a leader, so meta, cards and llms.txt agree. */
export function leaderSentence(top: Pick<LeaderboardRow, "owner" | "name" | "score">): string {
  return `${LEADER_QUALIFIER}: ${top.owner}/${top.name} (${(top.score ?? 0).toFixed(1)}).`;
}

export function leaderboardTitle(view: LeaderboardView): string {
  const { page, totalPages, model } = view;
  if (model === "overall") {
    return page > 1 ? pageTitle(`Leaderboard page ${page} of ${totalPages}`).absolute : HOME_TITLE;
  }

  const { label } = MODEL_BY_ID[model];
  return pageTitle(page > 1 ? `${label} leaderboard page ${page} of ${totalPages}` : modelBoardTitle(label)).absolute;
}

export function leaderboardDescription(view: LeaderboardView): string {
  const { page, model, allRows } = view;
  const total = allRows.length;
  const hosts = HOSTS_TEXT;
  const agent = model === "overall" ? undefined : MODEL_BY_ID[model].label;
  const fit = agent ? `how easy they are for ${agent} to work in` : "how ready they are for AI coding agents";

  if (page > 1) {
    const { first, last } = pageRanks(view);
    return fitDescription(`${hosts} repos ranked ${first} to ${last} of ${total} by ${fit}.`);
  }

  if (!agent) {
    return fitDescription(
      `Public ${hosts} repos ranked by how ready they are for AI coding agents, with a score for each agent.`,
      "Or score your own codebase.",
    );
  }

  const top = boardLeader(allRows);
  return fitDescription(
    `The ${agent} leaderboard: ${total} public repos ranked by ${fit}.`,
    ...(top ? [leaderSentence(top)] : []),
    `Scored on what ${agent} looks for.`,
  );
}

export function leaderboardMetadata(view: LeaderboardView): Metadata {
  // Each board page is its own canonical. Canonicalising page 2+ to the board
  // marked them duplicates and starved the repos only they link.
  const canonical = boardPagePath(view.model, view.page);
  const title = leaderboardTitle(view);
  const description = leaderboardDescription(view);
  const image =
    view.model === "overall"
      ? DEFAULT_OG_IMAGE
      : { url: `/og/model/${view.model}`, ...OG_IMAGE_SIZE, alt: modelBoardTitle(MODEL_BY_ID[view.model].label) };

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    // Page 2+ is a crawl path to the repos it lists, not a search result: one
    // board would otherwise be several near-identical listings in the index.
    ...(view.page > 1 && { robots: { index: false, follow: true } }),
    twitter: { ...TWITTER_DEFAULTS, images: [image], title, description },
    openGraph: { ...OG_DEFAULTS, images: [image], title, description, url: canonical, type: "website" },
  };
}
