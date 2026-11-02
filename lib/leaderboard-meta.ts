import type { Metadata } from "next";

import { LEADERBOARD_PAGE_SIZE } from "@/lib/constants/scoring";
import type { LeaderboardView } from "@/lib/leaderboard-view";
import { MODEL_BY_ID } from "@/lib/scoring/weights";
import { boardPagePath } from "@/lib/utils/leaderboard-href";
import { fitDescription, pageTitle } from "@/lib/utils/page-title";
import { APP_NAME, DEFAULT_OG_IMAGE, OG_DEFAULTS, OG_IMAGE_SIZE, TWITTER_DEFAULTS } from "@/lib/version";

const HOME_TITLE = `${APP_NAME} — is your codebase ready for AI agents?`;

export const HOSTS_TEXT = "GitHub, GitLab and Bitbucket";

// The searches that reach these boards are "best repos for Claude Code" and the like.
export function modelBoardTitle(label: string): string {
  return `Best repos for ${label}, ranked by agent readiness`;
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
    const first = (page - 1) * LEADERBOARD_PAGE_SIZE + 1;
    const last = Math.min(page * LEADERBOARD_PAGE_SIZE, total);
    return fitDescription(`${hosts} repos ranked ${first} to ${last} of ${total} by ${fit}.`);
  }

  if (!agent) {
    return fitDescription(
      `Public ${hosts} repos ranked by how ready they are for AI coding agents, with a score for each agent.`,
      "Or score your own codebase.",
    );
  }

  const top = allRows[0];
  return fitDescription(
    `${total} public ${hosts} repos ranked by ${fit}.`,
    ...(top ? [`${top.owner}/${top.name} leads with ${(top.score ?? 0).toFixed(1)}.`] : []),
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
    twitter: { ...TWITTER_DEFAULTS, images: [image], title, description },
    openGraph: { ...OG_DEFAULTS, images: [image], title, description, url: canonical, type: "website" },
  };
}
